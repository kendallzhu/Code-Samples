import spacy
nlp = spacy.load('en_core_web_sm')

import pronouns
import relations

# returns the first equivalent instance of a span if it is a coreference
def first_instance(span, coreferences, doc):
    for entity in coreferences:
        mentions = entity[0]
        indices = entity[1]
        if span in indices:
            # return text of first occurence
            return mentions[indices.index(min(indices))]
    return doc[span[0]: span[1]]

# demo relation extraction and noun resolution capabilities integrated
text = "Donald Trump is the president. Kendall Zhu is cool. He is the wife of Trump. \
Trump's lawyer Jay Sekulow stated that he had not been notified of any."
doc = nlp(text)

# use noun resolution + relation identification together
coreferences = pronouns.resolve_pronouns(doc)
relations = relations.extract_relation_indices(doc)
print(coreferences)
print(relations)

for r in relations:
    # use corefs to substitute first instance of entities in found relations
    p1, p2, r = map(lambda x: first_instance(x, coreferences, doc), (r[0], r[2], r[1]))
    print("entity 1:", p1)
    print("entity 2:", p2)
    print("relation:", r)
    
