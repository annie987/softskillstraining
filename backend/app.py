from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/')
def home():
    return "Hello, Soft Skills MVP!"

if __name__ == '__main__':
    app.run(debug=True)
