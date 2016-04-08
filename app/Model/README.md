Prediction model using data from Spring 2014 
with format:
5 labs -> Prelim -> 4 Labs -> Prelim -> 4 labs -> Prelim -> Final
and weightage:
lab (16/13)%, prelim 18%, final 30% 

===================================================================

params.p contains model parameters

===================================================================

basic_prediction_model.py contain function predictGrades(scores, params_file) to make grade prediction

input:
scores: list of integers
params_file: name of pickle file containing model parameters e.g. 'params'

output:
sorted_letter_grade: predicted grade in descending order of probability
sorted_grade_prob: probability of attaining corresponding grade in sorted_letter_grade 
