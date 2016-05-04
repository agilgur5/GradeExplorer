'''
Find cutoffs for grades.
'''

import numpy as np

# find cutoffs for one semester
# input: total scores, corresponding final grades
# output: grades, cutoffs  
def gradeCutoff(student_total,letter_grade):
        grade_full = ['A+','A','A-','B+','B','B-','C+','C','C-','D+','D','D-','F']
        cut_present = []
        cut_missing = []
        grade_cut_present = []
        n = len(grade_full)
        for i in range(n-1):
                student_i = [student_total[s] for s in range(len(student_total)) if letter_grade[s]==grade_full[i]]
                student_next = [student_total[s] for s in range(len(student_total)) if letter_grade[s]==grade_full[i+1]]
                if student_next != []:
                        max_next = max(student_next)
                        student_i_new = [student_i[j] for j in range(len(student_i)) if student_i[j] >= max_next]
                        if student_i_new != []:
                                grade_cut_present.append((min(student_i_new)+max_next)/2)
                                cut_present.append(i)
                        else:
                                grade_cut_present.append(max_next)
                                cut_present.append(i)
                elif student_next == [] and student_i != []:
                        # remove outliers 
                        q75, q25 = np.percentile(student_i, [75 ,25])
                        iqr = q75 - q25
                        student_i_new = [student_i[j] for j in range(len(student_i)) if student_i[j] <= q75+1.5*iqr]
                        grade_cut_present.append(min(student_i_new))
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
        return grade_full, grade_cut_final

