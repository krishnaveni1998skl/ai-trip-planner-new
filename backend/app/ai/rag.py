from pathlib import Path

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma


BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data" / "destinations"
VECTOR_DIR = BASE_DIR / "data" / "chroma"


def build_rag():
    documents = []

    for file in DATA_DIR.glob("*.pdf"):
        loader = PyPDFLoader(str(file))
        documents.extend(loader.load())

    if not documents:
        raise Exception("No PDF documents found in destinations folder")

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
    )

    chunks = splitter.split_documents(documents)

    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=str(VECTOR_DIR),
    )

    return vectorstore


def get_retriever():
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    vectorstore = Chroma(
        persist_directory=str(VECTOR_DIR),
        embedding_function=embeddings,
    )

    return vectorstore.as_retriever(
        search_kwargs={"k": 4}
    )


# --------------------------------------------------
# RAG SEARCH
# --------------------------------------------------

def search_rag(query: str, destination: str = ""):
    retriever = get_retriever()

    documents = retriever.invoke(query)

    # ----------------------------------------------
    # Strict destination filtering
    # ----------------------------------------------

    if destination:

        destination_key = (
            destination.strip()
            .lower()
            .replace(" ", "_")
        )

        filtered_documents = []

        for doc in documents:

            source = doc.metadata.get("source", "")

            file_name = Path(source).stem.lower()

            if file_name == destination_key:
                filtered_documents.append(doc)

        # Use filtered documents when available
       
            documents = filtered_documents

    # ----------------------------------------------
    # Return RAG results
    # ----------------------------------------------

    return [
        {
            "content": doc.page_content,
            "source": doc.metadata.get("source"),
        }
        for doc in documents
    ]