'''
Predict course grades
'''

import scipy as sp
from scipy import stats
import scipy.integrate as integrate
import scipy.optimize as optimize
import numpy as np
import cPickle as pickle
import argparse

def partialScoreWeighting(scores,weights):
	total_grade = 0
	for k,score in enumerate(scores):
		#total_grade = 0
		if scores[k]=='':
			scores[k] = 0
		total_grade +=weights[k]*float(scores[k])/100.0
	return total_grade

def computeDistX100Xt(mpc,vpc,Xt):
	def m(c):
		return sum([mpc[k]*c**(len(mpc)-k-1) for k in range(len(mpc))])
	def v(c):
		return sum([vpc[k]*c**(len(vpc)-k-1) for k in range(len(vpc))])
	def XtX100(c):
		return 1.0/np.sqrt(2*np.pi*v(c))*np.exp(-(Xt-m(c))**2/(2*v(c)))
	return XtX100

def product(f1,f2):
	def f1f2(c):
		return f1(c)*f2(c)
	return f1f2	

def predictGrades(scores, params_file):
	with open(params_file+'.p','rb') as fp:
		dict_params = pickle.load(fp)
	# grade cutoffs
	grades = ['A+','A','A-','B+','B','B-','C+','C','C-','D+','D','D-','F']
	grade_cuts = dict_params['grade_cuts']
	# prior distn of X100
	def X100(c):
		return 1.0/np.sqrt(2*np.pi*dict_params['var_X100'])*np.exp(-(c-dict_params['mean_X100'])**2/(2*dict_params['var_X100']))
	# predictions
	letter_grade_prob = {}
	ucutoff=100
	num_assignments = len(scores)
	if num_assignments==0:
		for lg,lcutoff in enumerate(grade_cuts):
			letter_grade_prob[grades[lg]] = integrate.quad(X100,lcutoff,ucutoff)[0]
			ucutoff = lcutoff
	else:  
		weights = dict_params['weights']
		Xt = partialScoreWeighting(scores,weights)
		if num_assignments == len(weights):
			for lg,lcutoff in enumerate(grade_cuts):
				if Xt<= ucutoff and Xt>lcutoff:
					letter_grade_prob[grades[lg]]= 1
				else:
					letter_grade_prob[grades[lg]]= 0
				ucutoff = lcutoff
		else:
			mpc = dict_params['coeff_meanl'][num_assignments-1]
			vpc = dict_params['coeff_varl'][num_assignments-1]
			pX100Xt = computeDistX100Xt(mpc,vpc,Xt)	
			posterior = product(pX100Xt, X100)
			for lg,lcutoff in enumerate(grade_cuts):
				letter_grade_prob[grades[lg]] = integrate.quad(posterior,max([lcutoff,Xt]),min([ucutoff,Xt+100-sum(weights[0:num_assignments])]))[0]
				ucutoff = lcutoff
	# sorting and normalizing
	sort_index = np.argsort(letter_grade_prob.values())[::-1]
	s = sum(letter_grade_prob.values())
	sorted_grade_prob = sorted(np.array(letter_grade_prob.values())/s)[::-1]
	sorted_letter_grade = [letter_grade_prob.keys()[sort_index[i]] for i in range(len(sort_index))]
	grade_dict = {}
	for s,sg in enumerate(sorted_letter_grade):
		grade_dict[sg] = sorted_grade_prob[s]
	return grade_dict
	#return sorted_letter_grade, sorted_grade_prob


if __name__ == "__main__":
	
	
	parser = argparse.ArgumentParser()
	parser.add_argument('-g', '--grades', nargs='+', type=int)
	args = parser.parse_args()

	scores = args.grades
	params_file = 'params'

	grade_dict = predictGrades(scores, params_file)
	print grade_dict
	#slg,sgp = predictGrades(scores,params_file)
	#print slg,sgp
	




