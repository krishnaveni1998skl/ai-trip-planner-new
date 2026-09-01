from pathlib import Path

from langchain_chroma import Chroma
from langchain_community.document_loaders import PyPDFLoader
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

DOCUMENTS_DIR = BASE_DIR / "data" / "documents"
CHROMA_DIR = BASE_DIR / "data" / "chroma_db"


# ============================================================
# EMBEDDINGS
# ============================================================

embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)


# ============================================================
# DESTINATION NAME
# ============================================================

def get_destination_name(pdf_file: Path) -> str:
    """
    Convert PDF filename into a clean destination name.
    """

    name = pdf_file.stem

    if name == "Travel_Planning_Guide":
        return "Travel_Planning"

    if name.endswith("_Travel_Guide"):
        return name.replace(
            "_Travel_Guide",
            "",
        )

    return name


# ============================================================
# BUILD VECTOR STORE
# ============================================================

def build_vector_store():
    """
    Load all valid PDFs, split them into chunks,
    add destination metadata, create embeddings,
    and store everything in ChromaDB.
    """

    print()
    print("========================================")
    print("       BUILDING RAG VECTOR STORE")
    print("========================================")
    print()

    pdf_files = sorted(
        DOCUMENTS_DIR.glob("*.pdf")
    )

    if not pdf_files:
        raise FileNotFoundError(
            f"No PDF files found in: {DOCUMENTS_DIR}"
        )

    all_documents = []

    for pdf_file in pdf_files:

        # ----------------------------------------------------
        # Ignore empty PDFs
        # ----------------------------------------------------

        if pdf_file.stat().st_size == 0:

            print(
                f"Skipping empty PDF: {pdf_file.name}"
            )

            continue

        destination = get_destination_name(
            pdf_file
        )

        print(
            f"Loading: {pdf_file.name}"
        )

        print(
            f"Destination: {destination}"
        )

        # ----------------------------------------------------
        # Load PDF
        # ----------------------------------------------------

        loader = PyPDFLoader(
            str(pdf_file)
        )

        pdf_documents = loader.load()

        # ----------------------------------------------------
        # Add our own metadata
        # ----------------------------------------------------

        for document in pdf_documents:

            document.metadata = {
                "destination": destination,
                "source_file": pdf_file.name,
                "document_type": "travel_guide",
                "page": document.metadata.get(
                    "page",
                    0,
                ),
            }

            all_documents.append(
                document
            )

    if not all_documents:

        raise ValueError(
            "No valid PDF documents were loaded."
        )

    print()
    print(
        f"Loaded PDF pages: {len(all_documents)}"
    )

    # ========================================================
    # TEXT SPLITTING
    # ========================================================

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=100,
    )

    chunks = splitter.split_documents(
        all_documents
    )

    print(
        f"Created chunks: {len(chunks)}"
    )

    # ========================================================
    # CREATE CHROMA
    # ========================================================

    vector_store = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=str(
            CHROMA_DIR
        ),
        collection_name="travel_knowledge",
    )

    print()
    print(
        "ChromaDB created successfully."
    )

    print(
        f"Vector store path: {CHROMA_DIR}"
    )

    print()

    return vector_store


# ============================================================
# GET VECTOR STORE
# ============================================================

def get_vector_store():

    if not CHROMA_DIR.exists():

        return build_vector_store()

    return Chroma(
        persist_directory=str(
            CHROMA_DIR
        ),
        embedding_function=embeddings,
        collection_name="travel_knowledge",
    )


# ============================================================
# SEARCH KNOWLEDGE
# ============================================================

def search_knowledge(
    query: str,
    destination: str | None = None,
    top_k: int = 5,
):
    """
    Search travel knowledge.

    If destination is provided,
    results are filtered to that destination.
    """

    if not query or not query.strip():

        return []

    vector_store = get_vector_store()

    # ========================================================
    # DESTINATION SEARCH
    # ========================================================

    if destination:

        destination = destination.strip()

        print()
        print(
            f"Searching destination: {destination}"
        )

        results = vector_store.similarity_search(
            query=query,
            k=top_k,
            filter={
                "destination": destination
            },
        )

    # ========================================================
    # GENERAL SEARCH
    # ========================================================

    else:

        print()
        print(
            "Searching all travel documents"
        )

        results = vector_store.similarity_search(
            query=query,
            k=top_k,
        )

    return results