from flask import Flask, request, render_template, jsonify
import os
from Model import multiple_prediction_model

app = Flask(__name__)
# not actually a secret since no need for authentication
app.secret_key = 'A0Zr98j/3yX R~XHH!jmN]LWX/,?RT'

# standard route
@app.route('/')
def loadViz():
  return render_template('/index.html')

# returns data that specifies what to place into the spec editor
@app.route('/getPrediction', methods=['GET'])
def getPrediction():
  predictGrades = multiple_prediction_model.predictGrades
  return jsonify(predictGrades(request.args.getlist('scores'), 'Model/params_all'))


if __name__ == '__main__':
  port = int(os.environ.get('PORT', 5000))
  debug = bool(os.environ.get('DEBUG', False))
  app.run(host='0.0.0.0', port=port, debug=True)
