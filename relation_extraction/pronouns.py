from neuralcoref import Coref
import spacy
nlp = spacy.load('en_core_web_sm')

'''
Return a list of tuples.
Each tuple contains a list of mentions that all refer to the same entity,
As well as the start and end indices of each mention in the original text.
(Unique identifier)
'''
def resolve_pronouns(doc):
    coref = Coref()
    coref.one_shot_coref(utterances = doc.text)
    mentions = coref.get_mentions()
    #print(mentions, coref.get_scores())
    clusters = coref.get_clusters(remove_singletons = True)
    alias_groups = []
    for cluster in clusters[0].values():
        # cluster here is a list of mention indices
        aliases = []
        indices = []
        for mention_index in cluster:
            mention = mentions[mention_index]
            aliases.append(mention.text)
            indices.append((mention.start, mention.end))
        alias_groups.append((aliases, indices))
    return alias_groups

# testing
#import wikipedia
#page = wikipedia.page("Donald Trump")
#text = page.content
#text = "Trump's lawyer Jay Sekulow stated that he had not been notified of any. Jay is cool"
#text = "Donald trump is the president. Trump came into office in 2016. He is terrible. Tillerson is secretary."
'''
text = "Donald Trump is huge. Donald Trump's lawyer Jay Sekulow \
stated that he had not been notified of any."
doc = nlp(text)
    
print(resolve_pronouns(doc))
for d_i in range(len(doc)):
    print(d_i, doc[d_i])
'''
