from flask import Flask, jsonify, request
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from flask_cors import CORS
from flask_pymongo import PyMongo
import bcrypt

app = Flask(__name__)
CORS(app)
app.config['MONGO_URI'] = 'mongodb://localhost:27017/MainProject'
mongo = PyMongo(app)

def hash_password(password):
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed

def create_user(name, mobileNo, email, password):
    user_id = mongo.db.users.count_documents({}) + 1
    hashed_password = hash_password(password)
    mongo.db.users.insert_one({
        "user_id": user_id,
        "name": name,
        "mobileNo": mobileNo,
        "email": email,
        "password": hashed_password
    })

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    name = data.get('name')
    mobileNo = data.get('mobileNo')
    email = data.get('email')
    password = data.get('password')

    create_user(name, mobileNo, email, password)
    return jsonify({"message": "User registered successfully"}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = mongo.db.users.find_one({"email": email})
    if user and bcrypt.checkpw(password.encode('utf-8'), user['password']):
        return jsonify({"message": "Login successful", "user_id": user['user_id']}), 200
    return jsonify({"message": "Invalid credentials"}), 401

# Load the dataset from the CSV file
data = pd.read_csv('clean_data.csv')

@app.route('/content-recommendation', methods=['GET'])
def content_based_recommendations():
    item_name = request.args.get('item_name')

    if not item_name:
        return jsonify({'error': 'Item name is required'}), 400

    # Use partial matching instead of exact matching
    matching_items = data[data['Name'].str.contains(item_name, case=False, na=False)]
    
    if matching_items.empty:
        return jsonify({'error': f"Item '{item_name}' not found in the dataset"}), 404

    # If multiple items match, select the first one for recommendations
    item_index = matching_items.index[0]

    # Existing recommendation logic
    tfidf_vectorizer = TfidfVectorizer(stop_words='english')
    data['Tags'] = data['Tags'].fillna('')  # Fill missing tags
    tfidf_matrix_content = tfidf_vectorizer.fit_transform(data['Tags'])
    cosine_similarities_content = cosine_similarity(tfidf_matrix_content, tfidf_matrix_content)

    similar_items = list(enumerate(cosine_similarities_content[item_index]))
    similar_items = sorted(similar_items, key=lambda x: x[1], reverse=True)

    top_n = int(request.args.get('top_n', 10))
    top_similar_items = similar_items[1:top_n + 1]

    recommended_item_indices = [x[0] for x in top_similar_items]
    recommended_items_details = data.iloc[recommended_item_indices][['Name', 'ReviewCount', 'Brand', 'ImageURL', 'Rating']]

    return jsonify(recommended_items_details.to_dict(orient='records'))


@app.route('/rating-recommendation', methods=['GET'])
def rating_based_recommendations():
    try:
        average_ratings = data.groupby(['Name', 'ReviewCount', 'Brand', 'ImageURL'])['Rating'].mean().reset_index()
        top_rated_items = average_ratings.sort_values(by='Rating', ascending=False)
        rating_base_recommendation = top_rated_items.head(10)

        rating_base_recommendation['Rating'] = rating_base_recommendation['Rating'].astype(int)
        rating_base_recommendation['ReviewCount'] = rating_base_recommendation['ReviewCount'].astype(int)

        return jsonify(rating_base_recommendation.to_dict(orient='records'))

    except Exception as e:
        return jsonify({'error': str(e)}), 500
data = pd.read_csv('clean_data.csv')  # Load your dataset here
train_data = pd.read_csv('clean_data.csv')  # Make sure the path is correct

def collaborative_filtering_recommendations(train_data, target_user_id, top_n=20):
    # Create the user-item matrix
    user_item_matrix = train_data.pivot_table(index='ID', columns='ProdID', values='Rating', aggfunc='mean').fillna(0)

    # Calculate the user similarity matrix using cosine similarity
    user_similarity = cosine_similarity(user_item_matrix)

    # Find the index of the target user in the matrix
    target_user_index = user_item_matrix.index.get_loc(target_user_id)

    # Get the similarity scores for the target user
    user_similarities = user_similarity[target_user_index]

    # Sort the users by similarity in descending order (excluding the target user)
    similar_users_indices = user_similarities.argsort()[::-1][1:]

    # Generate recommendations based on similar users
    recommended_items = set()  # Use a set to avoid duplicate recommendations

    for user_index in similar_users_indices:
        # Get items rated by the similar user but not by the target user
        rated_by_similar_user = user_item_matrix.iloc[user_index]
        not_rated_by_target_user = (rated_by_similar_user > 0) & (user_item_matrix.iloc[target_user_index] == 0)

        # Extract the item IDs of recommended items
        recommended_items.update(user_item_matrix.columns[not_rated_by_target_user])

        # Stop if we have enough recommendations
        if len(recommended_items) >= top_n:
            break

    # Get the details of recommended items
    recommended_items_details = train_data[train_data['ProdID'].isin(recommended_items)][['Name', 'ReviewCount', 'Brand', 'ImageURL', 'Rating']]

    return recommended_items_details.head(top_n)


@app.route('/recommendations', methods=['GET'])
def recommendations():
    user_id = request.args.get('user_id', type=int)
    if user_id is None:
        return jsonify({'error': 'User ID is required'}), 400

    # Call the collaborative filtering function
    recommended_items = collaborative_filtering_recommendations(train_data, user_id)

    return jsonify(recommended_items.to_dict(orient='records'))

@app.route('/search-similar-products', methods=['GET'])
def search_similar_products():
    item_description = request.args.get('description')

    if not item_description:
        return jsonify({'error': 'Description is required'}), 400

    # Use partial matching based on the description
    matching_items = data[data['Description'].str.contains(item_description, case=False, na=False)]

    if matching_items.empty:
        return jsonify({'error': 'No similar products found'}), 404

    # If multiple items match, select the first one for recommendations
    item_index = matching_items.index[0]

    # Existing content-based recommendation logic
    tfidf_vectorizer = TfidfVectorizer(stop_words='english')
    data['Tags'] = data['Tags'].fillna('')  # Fill missing tags
    tfidf_matrix_content = tfidf_vectorizer.fit_transform(data['Tags'])
    cosine_similarities_content = cosine_similarity(tfidf_matrix_content, tfidf_matrix_content)

    similar_items = list(enumerate(cosine_similarities_content[item_index]))
    similar_items = sorted(similar_items, key=lambda x: x[1], reverse=True)

    top_n = int(request.args.get('top_n', 10))
    top_similar_items = similar_items[1:top_n + 1]

    recommended_item_indices = [x[0] for x in top_similar_items]
    recommended_items_details = data.iloc[recommended_item_indices][['Name', 'ReviewCount', 'Brand', 'ImageURL', 'Rating']]

    return jsonify(recommended_items_details.to_dict(orient='records'))

df = pd.read_csv("clean_data.csv")  
#brands

# Load dataset
try:
    df = pd.read_csv("clean_data.csv")
except FileNotFoundError:
    print("Error: clean_data.csv not found!")
    df = pd.DataFrame(columns=["Brand", "prodID", "name", "description", "ImageURL"])  # Empty DataFrame

@app.route("/brands", methods=["GET"])
def get_brands():
    """Fetch unique brand names from the dataset"""
    if df.empty:
        return jsonify({"error": "Dataset is empty"}), 500  
    brands = df["Brand"].dropna().unique().tolist()
    return jsonify(brands)

@app.route("/products/brand", methods=["GET"])
def get_products_by_brand():
    print("started")
    """Fetch products based on brand name"""
    brand_name = request.args.get("brand")
    if not brand_name:
        return jsonify({"error": "Brand parameter is required"}), 400

    filtered_products = df[df["Brand"].str.lower() == brand_name.lower()]
    
    if filtered_products.empty:
        return jsonify({"message": "No products found for this brand"}), 404

    # Convert to JSON format
    products = filtered_products.to_dict(orient="records")
    print("hello rahil")
    return jsonify(products)

# ✅ New Endpoint to Fetch All Brands & Products
@app.route("/brands/products", methods=["GET"])
def get_brands_with_products():
    """Fetch all brands with their products"""
    if df.empty:
        return jsonify({"error": "Dataset is empty"}), 500

    brands_products = df.groupby("Brand").apply(lambda x: x.to_dict(orient="records")).to_dict()
    return jsonify(brands_products)
if __name__ == "__main__":
    app.run(debug=True)
