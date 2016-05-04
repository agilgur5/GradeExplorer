import csv
import json


def readGrades(fname):
        if '14' in fname:
                return readGrades14(fname)
        elif '15' in fname:
                return readGrades15(fname)
        else:
                return "NOT VALID FILE"



def readGrades15(fname):
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
                        letter_grade.append(student[-1])
                        other_grades.append(student[:-1])
                count+=1
	
	og = []
	for s,student in enumerate(other_grades):
		attendance = []
		g = []
		hs = []
		for h,assignment in enumerate(header[:-1]):
			if 'Attendance' in assignment.split(' '):
				try:
					attendance.append(int(student[h]))
				except:
					attendance.append(0)
			else:
				try:
					g.append(float(student[h]))
				except:
					g.append(0)
				hs.append(assignment)
		if 'f15' in fname:
			if sum(attendance) > 4:
				g.append(1)
			else:
				g.append(0)
			hs.append('Attendance')
		og.append(g)
        return hs,og,letter_grade


def readGrades14(fname):
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
                                other_grades.append(student[1:-1])
                count+=1
        return header[1:-1],other_grades,letter_grade


def gradesForAnton(fname):
	filename = fname.split('/')[1]+'.json'
	h,og,lg = readGrades14(fname)
	weightings = makeWeightings(fname)
	weights = []
	for assignment in h:
		if 'Lab' in assignment.split(' '):
                        weights.append(weightings['Lab'])
                elif 'Prelim' in assignment.split(' '):
                        weights.append(weightings['Prelim'])
                elif 'Final' in assignment.split(' '):
                        weights.append(weightings['Final'])
                elif 'Attendance' in assignment.split(' '):
                        weights.append(weightings['Attendance'])
                else:
                        weights.append(0)

	ng = []	
	if h[-1]=="Semester":
		for s in og:
			ngs = []
			for g in s[:-1]:
				try:
					ngs.append(float(g))
				except:
					ngs.append(0)
			ng.append(ngs)
	else:
		for s in og:
			ngs = []
			for g in s:
				try:
					ngs.append(float(g))
				except:
					ngs.append(0)
			ng.append(ngs)
	 

	dict_anton = {"cols":h, "weights":weights, "data":ng}
	with open(filename, 'w') as fp:
    		json.dump(dict_anton, fp)
	return dict_anton

	

def makeWeightings(fname):
	if '14' in fname:
		weightings = {'Lab':16/13.0, 'Prelim':18, 'Final':30, 'Attendance':0}
	elif 's15' in fname:
		weightings = {'Lab':15/13.0, 'Prelim':20, 'Final':25, 'Attendance':0}
	else:
		weightings = {'Lab':14/13.0, 'Prelim':20, 'Final':25, 'Attendance':1}
 	return weightings

def cummulativeWeightings(weightings,header):
        weights  = []
        cum_weights = []
        for assignment in header:
                if 'Lab' in assignment.split(' '):
                        weights.append(weightings['Lab'])
                elif 'Prelim' in assignment.split(' '):
                        weights.append(weightings['Prelim'])
                elif 'Final' in assignment.split(' '):
                        weights.append(weightings['Final'])
                elif 'Attendance' in assignment.split(' '):
                        weights.append(weightings['Attendance'])
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

