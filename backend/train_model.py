import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report
import pickle

# -----------------------------
# Step 1: Load dataset
# -----------------------------
df = pd.read_csv("cybersecurity_dataset.csv")  # must have 'complaint_text' & 'category'

# -----------------------------
# Step 2: Preprocessing
# -----------------------------
df['complaint_text'] = df['complaint_text'].str.lower()  # lowercase
df['complaint_text'] = df['complaint_text'].str.replace(r'[^a-z0-9\s]', '', regex=True)  # remove punctuation

# -----------------------------
# Step 3: Train-test split
# -----------------------------
X_train, X_test, y_train, y_test = train_test_split(
    df['complaint_text'], df['category'], test_size=0.2, random_state=42
)

# -----------------------------
# Step 4: Pipeline: TF-IDF + Logistic Regression
# -----------------------------
pipeline = Pipeline([
    ('tfidf', TfidfVectorizer(max_features=5000, ngram_range=(1,2))),  # unigrams + bigrams
    ('clf', LogisticRegression(max_iter=1000))
])

# -----------------------------
# Step 5: Train the model
# -----------------------------
pipeline.fit(X_train, y_train)

# -----------------------------
# Step 6: Evaluate
# -----------------------------
y_pred = pipeline.predict(X_test)
print("Model Evaluation on Test Set:")
print(classification_report(y_test, y_pred))

# -----------------------------
# Step 7: Save the trained model
# -----------------------------
with open("model.pkl", "wb") as f:
    pickle.dump(pipeline, f)

print("Model trained, evaluated, and saved as 'model.pkl'!")
