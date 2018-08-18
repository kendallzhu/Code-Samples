import spacy
nlp = spacy.load('en_core_web_sm')

'''
helper function to return the start+end indices of either a span or a token
'''
def get_indices(span_or_token):
        if type(span_or_token) == spacy.tokens.span.Span:
            return (span_or_token.start, span_or_token.end)
        elif type(span_or_token) == spacy.tokens.token.Token:
            return (span_or_token.i, span_or_token.i + 1)

'''
returns all the tokens that are part of the same entity as given token
'''
def token_to_group(token, entities):
    group = [token]
    # search through all entities to find if it's part (inefficient)
    for e in entities:
        if token in [t for t in e]:
            for t in e:
                group.append(t)
    # also check for conjuctions - append all conj if it's an "and"
    conj_pattern = [('conj', 'to')]
    and_pattern = [('cc', 'to', 'and')]
    if examine_pattern(token, and_pattern, entities):
        for t in examine_pattern(token, conj_pattern, entities):
            group.append(t)
    return list(set(group))

'''
returns the span of the entity a token is part of if it is so
(for consolidating tokens at the end)
'''
def token_to_entity(token, entities):
    for e in entities:
        if token in [t for t in e]:
            return e
    return token

'''
See if a token starts a given pattern
pattern in form: [(dependency type, arrow direction, optional: specific word), ...]
examine_pattern will try to follow this chain of dependencies to another token.
Returns a list of tokens.
'''
def examine_pattern(token, pattern, entities):
    tokens = [token]
    # examine each step of the dependency chain at a time
    for p_i in range(len(pattern)):
        dependency = pattern[p_i][0]
        direction = pattern[p_i][1]
        if direction not in ('to', 'from'):
            raise Exception("dependency direction must be 'to' or 'from'")
        # optional ability to include target words
        words = None
        if len(pattern[p_i]) > 2:
            words = pattern[p_i][2]
        new_tokens = []
        for t in tokens:
            if direction == 'to':
                new_tokens += [w for w in t.children if w.dep_ == dependency \
                               and (words == None or w.text in words)]
            elif direction == 'from' and t.dep_ == dependency:
                new_tokens += [t.head] if words == None or t.head.text in words else []
        tokens = []
        for t in new_tokens:
            tokens += token_to_group(t, entities)
    return list(set(tokens))

'''
Returns triples of tokens (entity1, relation word, entity2)
given a spacy-tokenized text.

Uses hand-built pattern matching.
'''
def extract_personal_relations(doc):
    # manually constructed patterns to look for relationships
    # see examine_pattern for how it's used, and try web demo to add more!    
    relation_to_other = [[('appos', 'to')],
                         [('appos', 'from')],
                         [('attr', 'from'), ('nsubj', 'to')],
                         # add more patterns here
                        ]
    entity_to_relation = [[('poss', 'from')],
                          [('pobj', 'from', ('of')), ('prep', 'from')]
                          # add more patterns here
                         ]
    # list of entities of interest (spacy spans)
    entities = doc.ents
    entity_tokens = [t for t in doc if t.pos_ == 'PROPN'] # could filter later
    results = []
    # examine for relationships involving those mentions
    for token in entity_tokens:
        # first find possible relation words from the entity
        possible_relations = []
        for pattern in entity_to_relation:
            relations = examine_pattern(token, pattern, entities)
            possible_relations += relations
        # then find possible other entities from that relation word
        for relation in possible_relations:
            for pattern in relation_to_other:
                possible_others = examine_pattern(relation, pattern, entities)
                for other in possible_others:
                    results.append((other, relation, token))
    # all before was single tokens, now merge into entities and delete repeats
    merged_results = []
    for r in results:
        merged_results.append(tuple(map(lambda x: token_to_entity(x, entities), r)))
    return list(set(merged_results))

'''
Returns triples of indices (entity1, relation word, entity2)
given a spacy-tokenized text.

Calls extract_personal_relations.
'''
def extract_relation_indices(doc):
    relations = extract_personal_relations(doc)        
    return [list(map(get_indices, (a, b, c))) for (a, b, c) in relations]


# testing
#import wikipedia
#page = wikipedia.page("Donald Trump")
#text = page.content
#text = "Donald Trump's lawyer Jay Sekulow stated that he had not been notified of any."
'''
text = "Kendall Zhu is wife of Trump. Donald Trump is huge. Donald Trump's lawyers Jay Sekulow \
and Bob stated that they had not been notified of any."
doc = nlp(text)

relations = extract_personal_relations(doc)
for p1, r, p2 in relations:
    print((p1.text, r.text, p2.text))
    p2_start = get_indices(p2)[0]
    p1_end = get_indices(p1)[1]
    print("Source:", doc[max(0, p2_start - 10):p1_end + 10])
    #print('{} is the {} of {}\n'.format(p1.text, r.text, p2.text))

print(extract_relation_indices(doc))
'''

