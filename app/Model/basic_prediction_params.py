'''
Outputs model parameters
'''

import scipy as sp
from scipy import stats
import scipy.integrate as integrate
import scipy.optimize as optimize
import csv
from ast import literal_eval
import json
import numpy as np
import argparse
from matplotlib import pyplot as plt
from collections import OrderedDict

range_ind = 0.1 #interval/2 for finding mean and variances for t
degree_mu = 2  #degree for polynomial interpolation
degree_var = 2

def readGrades(fname):
	grade_full = ['A+','A','A-','B+','B','B-','C+','C','C-','D+','D','D-','F']
	final_score = []
	other_grades = []
	letter_grade = []
	f = file(fname)
	student_grades = csv.reader(f)
	count = 0
	for student in student_grades:
		if count==0:
			header = student
		else:
			if any(student[-1] == grade_full[i] for i in range(len(grade_full))): 
				letter_grade.append(student[-1])
				other_grades.append(student[1:-2])
		count+=1
	return header[1:-2],other_grades,letter_grade

def cummulativeWeightings(header):
	weights = []
	cum_weights = []
	for assignment in header:
		if 'Lab' in assignment.split(' '):
			weights.append(16/13.0)
		elif 'Prelim' in assignment.split(' '):
			weights.append(18)
		elif 'Final' in assignment.split(' '):
			weights.append(30)
		else:
			weights.append(0)
	s = 0
	for w in weights:
		s+=w
		cum_weights.append(s)

	return weights, cum_weights

def computeTotalPoints(weights, grades):
	student_total = []
	for student in grades:
		total_grade = 0
		for k,weight in enumerate(weights):
			if student[k]=='':
				student[k] = 0
			try:
				total_grade+=weight*float(student[k])/100.0
			except:
				total_grade+=0
		student_total.append(total_grade)
	return student_total

def partialScoreWeighting(scores,weights):
	total_grade = 0
	for k,score in enumerate(scores):
		#total_grade = 0
		if scores[k]=='':
			scores[k] = 0
		total_grade +=weights[k]*float(scores[k])/100.0
	return total_grade

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

def meanvarc(partials,totals,weight,cum_weight):
	mit = np.min(totals)
	mat = np.max(totals)
	diff = (mat - mit)*range_ind
	enum = mat - diff
	dict_enum = {}

	#get people with total in some range for all ranges
	while enum >= mit:
		enum_people = []
		for i,t in enumerate(totals):
			if t>=enum and t < enum + diff:
				enum_people.append(i)
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
	mpc = fitpoly(dict_enum.keys(),means,cum_weight[weight-1],degree_mu,'mu')
	vpc = fitpoly(dict_enum.keys(),variances,cum_weight[weight-1],degree_var,'var')
	return mpc,vpc

def computeDistX100Xt(mpc,vpc,Xt):
	def m(c):
		return sum([mpc[k]*c**(len(mpc)-k-1) for k in range(len(mpc))])
	def v(c):
		return sum([vpc[k]*c**(len(vpc)-k-1) for k in range(len(vpc))])
	def XtX100(c):
		return 1.0/np.sqrt(2*np.pi*v(c))*np.exp(-(Xt-m(c))**2/(2*v(c)))
	return XtX100

def gradeCutoff(student_total,letter_grade):
	grade_full = ['A+','A','A-','B+','B','B-','C+','C','C-','D+','D','D-','F']
	cut_present = []
	cut_missing = []
	grade_cut_present = []
	n = len(grade_full)
	for i in range(n-1):
		student_i = [student_total[s] for s in range(len(student_total)) if letter_grade[s]==grade_full[i]]
		student_next = [student_total[s] for s in range(len(student_total)) if letter_grade[s]==grade_full[i+1]]
		if student_i != [] and student_next != []:
			grade_cut_present.append((min(student_i)+max(student_next))/2)
			cut_present.append(i)
		elif student_i != [] and student_next ==[]:
			grade_cut_present.append(min(student_i))
			cut_present.append(i)
		elif student_next != [] and student_i ==[]:
			grade_cut_present.append(max(student_next))
			cut_present.append(i)
		else:
			cut_missing.append(i)
	cut_present.append(n-1)
	grade_cut_present.append(0)
	grade_cut_missing = np.interp(cut_missing, cut_present, grade_cut_present)
	cut = cut_present + cut_missing
	grade_cut = grade_cut_present + list(grade_cut_missing)
	grade_cut_final = []
	sorted_index = np.argsort(cut)
	for si in sorted_index:
		grade_cut_final.append(grade_cut[si])
	grade_dictionary = OrderedDict(zip(grade_full, grade_cut_final))
	# WHICH ONE TO RETURN???
	return grade_full, grade_cut_final
	
def f(x, *p):
    return np.poly1d(p)(x)

# x indep, y dep, t time, d degree polynomial, type 'mu' / 'var'
# returns list of coeff of degree length(p)-index
def fitpoly(x, y, t, d, type):    
    x = x+[0,100]
    if type == 'mu':
        y = y+[0,t]
	#print y
    elif type == 'var':
        y = y+[0,0]
    N = len(x)
    sigma = list(np.ones(N))
    sigma[-2] = 0.01
    sigma[-1] = 0.01
    p, _ = optimize.curve_fit(f, x, y, np.zeros(d+1), sigma=sigma) # highest degree first
    return p



if __name__ == "__main__":
	
	import cPickle as pickle
	
	data_path = "../../Data/s14_all_select.csv"

	header, grades, final = readGrades(data_path)
	weights, cum_weights = cummulativeWeightings(header)
	totals = computeTotalPoints(weights, grades)
	
	# mean and variance of prior distn of X100
	mean_X100 = np.mean(totals)
	var_X100 = np.var(totals)	

	# polynomial coefficients of fit to mean and variance of likelihood
	coeff_meanl = []
	coeff_varl= []
	num_assignments = len(weights)
	for i in range(1,num_assignments):
		partials = computePartialPoints(i, weights, grades)
		mpc,vpc = meanvarc(partials,totals,i,cum_weights)
		coeff_meanl.append(mpc)
		coeff_varl.append(vpc)

	# grade cutoffs
	grades, grade_cuts = gradeCutoff(totals,final)

	dict_param = {}
	dict_param['weights'] = weights
	dict_param['mean_X100'] = mean_X100
	dict_param['var_X100'] = var_X100
	dict_param['coeff_meanl'] = coeff_meanl
	dict_param['coeff_varl'] = coeff_varl
	dict_param['grade_cuts'] = grade_cuts

	with open('params.p','wb') as fp:
		pickle.dump(dict_param, fp)





