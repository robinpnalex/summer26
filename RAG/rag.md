## hallucination
confidently generate wrong answers

# retrieval augmented generation

- basically allows llm to access data from - source in realtime upon asking of the query
- makes it more accurate and quality


## pipelines

1. indexing : vector embed chunks of data(using bi-encoders(open ai has a good one)) store in vector database(pinecone, chromadb)


    - document parsing

    - HTML cleanup

    - table extraction

    - OCR for images

    - metadata tagging

    - chunking strategy

    - enrichment / rewriting

2. retrieval
    - query embedding
    - semantic search
3. generation

### chunking
    to fit context window of llm - break data