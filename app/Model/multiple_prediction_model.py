'''
Performs validation of one semester against multiple semesters.
'''

import scipy as sp
from scipy import stats
import scipy.integrate as integrate
import scipy.optimize as optimize
import numpy as np
import cPickle as pickle

range_ind = 0.1 #interval/2 for finding mean and variances for t
degree_mu = 2  #degree for polynomial interpolation
degree_var = 2

def partialScoreWeighting(scores,weights_test):
        total_grade = 0
        for k,score in enumerate(scores):
                #total_grade = 0
                if scores[k]=='':
                        scores[k] = 0
                total_grade +=weights_test[k]*float(scores[k])/100.0
        return total_grade


# find all training student performances at t
def computePartialPoints_t(t,weights_train,cum_weights_train,grades_train):
	student_partial = []
	for k, weights in enumerate(weights_train):
		num_assignments = len(weights)
		ind = [i for i in range(num_assignments) if cum_weights_train[k][i]==t]
		if ind != []:
			student_partial += computePartialPoints(ind[0]+1,weights,grades_train[k])
		elif t<weights[0]: # interporlate
			t_above = cum_weights_train[k][0]
			student_partial_above = computePartialPoints(1,weights,grades_train[k])
			n = len(student_partial_above)
                        for i in range(n):
                                grad = student_partial_above[i]/t_above
                                student_partial.append(grad*t)
		else: # interpolate
			ind_below = max([i for i in range(num_assignments) if cum_weights_train[k][i]<t])+1
                        ind_above = min([i for i in range(num_assignments) if cum_weights_train[k][i]>t])+1
			t_below = cum_weights_train[k][ind_below-1]
			t_above = cum_weights_train[k][ind_above-1]
			student_partial_below = computePartialPoints(ind_below,weights,grades_train[k])
			student_partial_above = computePartialPoints(ind_above,weights,grades_train[k])
			n = len(student_partial_below) # number of stuents
			for i in range(n):
				grad = (student_partial_above[i]-student_partial_below[i])/(t_above-t_below)
				student_partial.append(student_partial_below[i]+grad*(t-t_below))
	return student_partial
	

def computePartialPoints(ind, weights,grades):
	student_partial = []
	for student in grades:
		partial_total = 0
		for k, weight in enumerate(weights[:ind]):
			if student[k]=='':
				student[k] = 0
			try:
				partial_total+=weight*float(student[k])/100.0
			except:
				partial_total+=0
		student_partial.append(partial_total)
	return student_partial
	

def computeDistX100(totals):
	mean = np.mean(totals)
	var = np.var(totals)
	def X100(c):
		return 1.0/np.sqrt(2*np.pi*var)*np.exp(-(c-mean)**2/(2*var))
	return X100


def meanvarone(partials,people):
	c_totals = []
	for p in people:
		c_totals.append(partials[p])
	mean_c = np.mean(c_totals)
	var_c = np.var(c_totals)
	return mean_c,var_c


def meanvarc(partials,totals,t):
	mit = np.min(totals)
	mat = np.max(totals)
	print mit, mat
	diff = min(5, (mat - mit)*range_ind)
	enum = mat - diff
	dict_enum = {}

	#get people with total in some range for all ranges
	while enum >= mit:
		enum_people = []
		for i,tot in enumerate(totals):
			if tot>=enum and tot < enum + diff:
				enum_people.append(i)
		if enum_people != []:
			dict_enum[enum+diff/2.0] = enum_people
		enum-=diff
	#compute mean and var for these people
	means = []
	variances = []	
	for en in dict_enum.keys():
		if len(dict_enum[en])>0:
			mv = meanvarone(partials,dict_enum[en])
			means.append(mv[0])
			variances.append(mv[1])
	mpc = fitpoly(dict_enum.keys(),means,t,degree_mu,'mu')
	vpc = fitpoly(dict_enum.keys(),variances,t,degree_var,'var')
	return mpc,vpc


def computeDistXtX100(mpc,vpc,Xt):
	def m(c):
		return sum([mpc[k]*c**(len(mpc)-k-1) for k in range(len(mpc))])
	def v(c):
		return sum([vpc[k]*c**(len(vpc)-k-1) for k in range(len(vpc))])
	def XtX100(c):
		return 1.0/np.sqrt(2*np.pi*v(c))*np.exp(-(Xt-m(c))**2/(2*v(c)))
	return XtX100


def interpf(x, *p):
    return np.poly1d(p)(x)


# x indep, y dep, t time, d degree polynomial, type 'mu' / 'var'
# returns list of coeff of degree length(p)-index
def fitpoly(x, y, t, d, type_param):    
	x = x+[0,100]
    	if type_param == 'mu':
		y = y+[0,t]
    	elif type_param == 'var':
        	y = y+[0,0]
    	N = len(x)
    	sigma = list(np.ones(N))
    	sigma[-2] = 0.01
    	sigma[-1] = 0.01
	p, _ = optimize.curve_fit(interpf, x, y, np.zeros(d+1), sigma=sigma) # highest degree first
	return p


# compute posterior as a function of c
def product(f1,f2):
	def f1f2(c):
		return f1(c)*f2(c)
	return f1f2


# predict grades
def predictGrades(scores, params_file):
	with open(params_file+'.p','rb') as fp:
		dict_params = pickle.load(fp)
	# grade_cutoffs
	grades = ['A+','A','A-','B+','B','B-','C+','C','C-','D+','D','D-','F']
	grade_cuts_train = dict_params['grade_cuts']
	ng = len(grade_cuts_train)
	# prior distn of X100
	def pX100(c):
		return 1.0/np.sqrt(2*np.pi*dict_params['var_X100'])*np.exp(-(c-dict_params['mean_X100'])**2/(2*dict_params['var_X100']))
	# prediction
	letter_grade_prob = {}
	num_assignments = len(scores)
	if num_assignments == 0:
		prob = []
		for grade_cuts in grade_cuts_train:
			letter_grade_prob = {}
			ucutoff=100
			for lg,lcutoff in enumerate(grade_cuts):
                                letter_grade_prob[grades[lg]] =  integrate.quad(pX100,lcutoff,ucutoff)[0]
                                ucutoff = lcutoff
			norm_constant = np.sum(letter_grade_prob.values())
			letter_grade_prob = {x: letter_grade_prob[x]/norm_constant for x in letter_grade_prob}
			prob.append(letter_grade_prob)
		letter_grade_prob_final = [np.mean([prob[i][j] for i in range(ng)]) for j in grades]
	elif num_assignments == dict_params['weights_test']:
		Xt = partialScoreWeighting(scores,dict_params['weights_test'])
		prob = []
		for grade_cuts in grade_cuts_train:
			letter_grade_prob = {}
			ucutoff=100
	                for lg,lcutoff in enumerate(grade_cuts):
				if Xt<= ucutoff and Xt>lcutoff:
					letter_grade_prob[grades[lg]]= 1
				else:
                                        letter_grade_prob[grades[lg]]= 0
				ucutoff = lcutoff
			norm_constant = np.sum(letter_grade_prob.values())
			letter_grade_prob = {x: letter_grade_prob[x]/norm_constant for x in letter_grade_prob}
                	prob.append(letter_grade_prob)
                letter_grade_prob_final = [np.mean([prob[i][j] for i in range(ng)]) for j in grades]
	else:
		mpc = dict_params['coeff_meanl'][num_assignments-1]
		vpc = dict_params['coeff_varl'][num_assignments-1]
		weights_test = dict_params['weights_test']
		Xt = partialScoreWeighting(scores,weights_test)
		pXtX100 = computeDistXtX100(mpc,vpc,Xt)
		posterior = product(pXtX100, pX100)
		prob = []
		for grade_cuts in grade_cuts_train:
			letter_grade_prob = {}
			ucutoff=100
			for lg,lcutoff in enumerate(grade_cuts):
				if Xt<lcutoff and Xt+100-sum(weights_test[0:num_assignments])<lcutoff:
					letter_grade_prob[grades[lg]] = 0
				elif Xt>ucutoff and Xt+100-sum(weights_test[0:num_assignments])>ucutoff:
					letter_grade_prob[grades[lg]] = 0
				else:
					letter_grade_prob[grades[lg]] = integrate.quad(posterior,max([lcutoff,Xt]),min([ucutoff,Xt+100-sum(weights_test[0:num_assignments])]))[0]
					ucutoff = lcutoff
			norm_constant = np.sum(letter_grade_prob.values())
                        letter_grade_prob = {x: letter_grade_prob[x]/norm_constant for x in letter_grade_prob}
                        prob.append(letter_grade_prob)
                letter_grade_prob_final = [np.mean([prob[i][j] for i in range(ng)]) for j in grades]
	# sorting and normalizing
	sort_index = np.argsort(letter_grade_prob_final)[::-1]
	s = sum(letter_grade_prob_final)
	sorted_grade_prob = sorted(np.array(letter_grade_prob_final)/s)[::-1]
	sorted_letter_grade = [grades[sort_index[i]] for i in range(len(sort_index))]
	#return sorted_letter_grade, sorted_grade_prob
	grade_dict = {}
	for s,sg in enumerate(sorted_letter_grade):
		grade_dict[sg] = sorted_grade_prob[s]
	return grade_dict

if __name__ == "__main__":

	import argparse
	
	parser = argparse.ArgumentParser()
	parser.add_argument('-g', '--grades', nargs='+', type=int)
	args = parser.parse_args()

	scores = args.grades
	params_file = 'params_all'

	letter_grade, grade_prob = predictGrades(scores, params_file)
	print letter_grade, grade_prob
