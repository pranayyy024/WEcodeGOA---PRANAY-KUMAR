from fastapi import FastAPI

app = FastAPI(title="campsupport-ai")

@app.get("/")
def read_root():
    return {"message": "Campus support AI backend is running"}
