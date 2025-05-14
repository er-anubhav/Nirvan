import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder
import joblib
import os

def load_data(csv_path):
    df = pd.read_csv(csv_path)
    df['username'] = df['username'].str.replace('"', '')
    df['date'] = pd.to_datetime(df['date'], dayfirst=True)
    return df

def label_priority(df):
    def get_priority(sev):
        if sev >= 4:
            return 'High'
        elif sev == 3:
            return 'Medium'
        else:
            return 'Low'
    df['priority'] = df['severity_rating'].apply(get_priority)
    return df


def train_model(df):
    le = LabelEncoder()
    df['category_encoded'] = le.fit_transform(df['category'])
    df['combined_text'] = df['problem_statement'] + ' category_' + df['category_encoded'].astype(str)

    X = df['combined_text']
    y = df['priority']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer()),
        ('clf', LogisticRegression(max_iter=1000))
    ])

    pipeline.fit(X_train, y_train)


    joblib.dump(pipeline, 'priority_model.pkl')
    joblib.dump(le, 'category_encoder.pkl')

    return pipeline


def predict_priority(problem_statement, category):

    model = joblib.load('priority_model.pkl')
    le = joblib.load('category_encoder.pkl')

    cat_encoded = le.transform([category])[0]
    combined = [f"{problem_statement} category_{cat_encoded}"]

    prediction = model.predict(combined)
    return prediction[0]


if __name__ == "__main__":
    csv_file = "civic_problem dataset.csv" 
    if not os.path.exists("priority_model.pkl"):
        df = load_data(csv_file)
        df = label_priority(df)
        train_model(df)
        print("Model trained and saved.")

    test_statement = "Overflowing garbage bins in residential area"
    test_category = "sanitation"
    predicted_priority = predict_priority(test_statement, test_category)
    print(f"Predicted priority: {predicted_priority}")
