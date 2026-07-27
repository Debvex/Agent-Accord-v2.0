import os
from typing import List
from pathlib import Path
from dotenv import load_dotenv
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document


env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)


class DocumentRAG:
    def __init__(self):
        self.embeddings = None
        self.vectorstore = None
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
            separators=["\n\n", "\n", ". ", " ", ""]
        )

    def _ensure_embeddings(self):
        if self.embeddings is None:
            self.embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

    def ingest_document(self, text: str, metadata: dict = None):
        self._ensure_embeddings()
        
        if metadata is None:
            metadata = {}

        docs = self.text_splitter.create_documents([text], [metadata])
        self.vectorstore = Chroma.from_documents(
            documents=docs,
            embedding=self.embeddings,
            collection_name="document_store"
        )

    def search(self, query: str, k: int = 3) -> List[Document]:
        if not self.vectorstore:
            return []

        return self.vectorstore.similarity_search(query, k=k)

    def clear(self):
        self.vectorstore = None


rag_instance = DocumentRAG()
