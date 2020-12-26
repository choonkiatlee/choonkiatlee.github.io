---
layout: post
title: "Simple Document Classification"
tags: [Machine Learning]
toc: true
icon: /img/cats/ml.svg
keywords: nlp sentiment analysis feature extraction
---

### Introduction

Recently, I've gotten some spare time, and decided that I would use it to tackle one of the problems that I have been pondering about for a while: text classification. 

Broadly speaking, the text classification task is to assign a document to one or more classes or categories. I like this phrasing of the text classification task, as its broadness allows us to derive some very useful applications from it. 

Some example applications are:

* Sentiment Analysis
* Text Labelling
* Intent Detection
* Spam Filtering
* Language Detection

In this short blog, I will be looking at various approaches to text classification, and demonstrating how they can be used to accomplish a variety of different tasks!

### General Machine Learning Approach

Instead of relying on manually crafted rules, text classifcation with machine learning learns to make classifications based on past observations. 

1) The first step towards training a ML classifier is feature extraction. In feature extraction, we transform the input (in this case unstructured text) into a numerical representation in the form of a vector. 

2) Next, we then have to choose between performing _unsupervised_ learning (where we seek to classify our data set without giving it labelled training data) and performing _supervised_ learning (where we provide our algorithm with correctly labelled training data and use it to _infer_ the classification of the test set)

* Unsupervised learning:

    < Insert pic here >

* Supervised learning:

    < insert pic here >

3) Lastly, we can use our trained ML model to perform _inference_ on a new pieces of text!






### Feature Extraction

In this section, I will discuss feature extraction with relation to a few common feature extraction techniques. However, before getting into the meat of the feature extraction process, let's discuss an easily overlooked part of feature extraction -- pre-processing (a.k.a. data cleaning)

__Some basic intuition!__
Why do we do feature extraction and what is the intuition behind our numerical representation of text as vectors?

When analysing large sets of data (as many text classification problems end up being), we typically want to reduce the number of resources required to accurately describe the data. With this lens, we can view feature extraction as a form of _dimensionality reduction_. In the rest of the article, we will refer to the vector space spanned by the features that we've extracted as the _feature space_.

Alternatively, we can think about feature extraction as a process of placing our data into a space that is more tractable to perform inference over.  

For example, imagine that we had different academic articles from different fields of research, (Eg: Political Science vs Physics), and we wanted to be able to classify our academic articles back into the appropriate category. One very simple and naiive (but possibly very effective!) feature to use might be the count of numbers within each article. Intuitively, we would expect the political science articles to contain less numbers, and we could then find a simple threshold below which we would classify articles as being part of the Political Science category.

This simple example illustrates 2 advantages of performing inference over the _feature space_ rather than the raw text space. 
Firstly, instead of storing and processing all the data from each article each time when performing our analysis, we only need to store the count of numbers from each article! In this case, we've effectively given our problem a 1-dimensional feature space. Note that this means that our inference will also be over the 1-dimensional feature space! If our data show good separation in this feature space, we will possibly have a much more robust classifier.


__Pre-processing__

As we are usually dealing with unstructured text, we typically need to _clean_ our text before extracting features to reduce spurious features that we don't require! This typically involves removing words / symbols that are uninformative and do not give us additional information about the textual content of the article.

1) Removing common and uninformative words / symbols

In most data sources, there are typically words / symbols that are common in all texts and add no informational value in our textual classification. Some common words include `and, or, but` and we typically want to remove these from our texts before feature extraction to improve the signal to noise ratio of our features. Other common symbols that we might want to exclude include punctuation marks, numbers, and whitespace!

```python
import nltk
import string

def replace_multiple_characters(input_str, chars_to_replace):
    for char in chars_to_replace:
        if char in input_str:
            input_str = input_str.replace(char, '')
    return input_str

def remove_common_symbols(doc, symbols_to_remove):
    doc = replace_multiple_characters(doc, symbols_to_remove)
    doc = doc.lower()

symbols_to_remove = string.punctuation + string.digits
words_to_remove = nltk.corpus.stopwords.words('english')
```

2) Grouping related words

For grammatical reasons, documents typically use different forms of a word (eg: `organise`, `organises`, `organising`). These different forms typically hold the same meaning for us in our text classification process as we would typically expect a search for `organise` to return results with `organising` in the text. 

Two methods are used to group related words: 

* Stemming
* Lemmatization

_Stemming_ referes to a heuristic process whereby we remove the ends of words in order to keep just the "base" word. eg: `organises -> organise`. Whilst simpler to implement, stemming suffers from some inherent inaccuracies.

_Lemmatization_ is a more "proper" way to group related words, and uses a vocabulary and morphological analysis of words to return just the base or dictionary form of the word, known as a _lemma_.

Stemming and Lemmatization differ in subtle ways. For example, stemming of the word `saw` might return just `s` whilst lemmatization of the same word might return `see` or `saw` depending on whether or not the word is a verb or a noun.

In Python, we can easily implement lemmatization by calling the NLTK library. The complete pre-processing code is shown below:

```python
import nltk
import string

def replace_multiple_characters(input_str, chars_to_replace):
    for char in chars_to_replace:
        if char in input_str:
            input_str = input_str.replace(char, '')
    return input_str

def remove_common_symbols(doc, symbols_to_remove):
    doc = replace_multiple_characters(doc, symbols_to_remove)
    doc = doc.lower()

symbols_to_remove = string.punctuation + string.digits
words_to_remove = nltk.corpus.stopwords.words('english')

sample_doc = "Hello World! You're learning about machine learning"

first_pass_clean = remove_common_symbols(sample_doc, symbols_to_remove)             # Remove common symbols from the doc first

words = nltk.word_tokenize(first_pass_clean)          # Use this function to split a piece of text into its constituent words!

lemmatizer = nltk.stem.WordNetLemmatizer()
lemmatized = [lemmatizer(word) for word in words if word not in words_to_remove]    # Lemmatization + stopword removal        
```


__Features__

1) TF-IDF family of features

At its core, TF-IDF (short for term frequency-inverse document frequency) is a feature that aims to reflect how important a word is to a particular document in a collection of documents. For example, if the word "vector" appears a lot in a particular document, it is much more likely that the document is a physics scientific article rather than a discourse on political science. 

There are 2 components to TF-IDF

        1) Term Frequency:

        Suppose that we have a set of documents and we want to find out which query term best describes our document. A simple way of doing that is to count the number of times a particular _term_ (word) occurs in a document -- this simple metric is known as the _term frequency_. The larger the number of a particular term in a document, the larger the term frequency.

        2) Inverse Document Frequency: 

        There are some limitations with using solely term frequency as our only weighting procedure. For example, if we had not removed stopwords such as `the` in our pre-processing, term frequency will tend to incorrectly emphasize documents which use `the` frequently, with less weight given to more meaningful words such as `vector` or `Liberal`. 

        Inverse document frequency seeks to give a larger weight to terms that occur less frequently across documents, as these terms are more likely to contain information that enables us to better separate the documents. Thus, we can consider the IDF as a measure of a term's _specificity_. 

Calculation of Term Frequency:

There are a variety of ways of calculating term frequency:

1) Bag-of-words

One of the simplest features that we can generalise is the bag-of-words model. In this model, we keep only the count of every word in the text. Imagine this as us treating each document as a "bag of words" and then labelling each bag with the number of words in the bag. 

Example application: Bayesian Spam Filtering

2) TF-IDF



