import numpy as np
from math import *
from matplotlib.pyplot import *

def find_sol(decimals):
	step = '0.'

	for _ in range(decimals):
		step += '0'

	step += '1'
	step = float(step)
	print(step)

	error = 0.1
	ra_range = np.arange(0.1, 1.0, step)

	# print("ra:", ra_range)

	for ra in ra_range:
		rb_range = np.arange(ra+0.25, 6.0, step)
		# print("rb: ", rb_range)
		for rb in rb_range:
			rc_range = np.arange(rb+0.25, 10.0, step)
			# print("rc: ", rc_range)
			for rc in rc_range:
				rd_range = np.arange(rc+0.25, 12.0, step)
				# print("rd: ", rd_range)
				for rd in rd_range:
					# Calc ra
					temp = (144-(rd+0.25)**2)/5

					if temp < 0:
						break

					ra_calc = sqrt((144-(rd+0.25)**2)/5)
					ra_upper = ra_calc+error
					ra_lower = ra_calc-error

					if ra >= ra_lower and ra <= ra_upper:
						# Calc rb

						rb_calc = sqrt(((144-(rd+0.25)**2)/4)+(ra+0.25)**2)
						rb_upper = rb_calc+error
						rb_lower = rb_calc-error

						if rb >= rb_lower and rb <= ra_upper:
							# Calc rc

							rc_calc = sqrt(((144-(rd+0.25)**2)/3)+(rb+0.25)**2)
							rc_upper = rc_calc+error
							rc_lower = rc_calc-error

							if rc >= rc_lower and rc <= rc_upper:
								# Calc rd

								rd_calc = sqrt(((144-(rd+0.25)**2)/3)+(rc+0.25)**2)
								rd_upper = rd_calc+error
								rd_lower = rd_calc-error

								if rd >= rd_lower and rd <= rd_upper:
									print("eureka", ra, rb, rc, rd)
									break

def concentric_circles(min_dist, radius):
	num_dec = 3
	outer_width = 0.5

	area_e = pi * ((radius**2)-((radius-outer_width)**2))
	area_a = area_e / 5
	area_b = area_e / 4
	area_c = area_e / 3
	area_d = area_e / 2
	poss_sol = {}

	outer_a = round(sqrt(area_a/pi),num_dec)

	inner_b_range = np.arange(outer_a+min_dist, outer_a+min_dist+1, 0.1)
	
	for inner_b in inner_b_range:
		outer_b = round(sqrt((area_b/pi)+(inner_b**2)),num_dec)

		inner_c_range = np.arange(outer_b+min_dist, outer_b+min_dist+1, 0.1)

		for inner_c in inner_c_range:
			outer_c = round(sqrt((area_c/pi)+inner_c**2),num_dec)

			inner_d_range = np.arange(outer_c+min_dist, outer_c+min_dist+1, 0.1)

			for inner_d in inner_d_range:
				outer_d = round(sqrt((area_d/pi)+inner_d**2),num_dec)

				if outer_d <= radius-outer_width-min_dist:
					sol = [outer_a, round(inner_b,num_dec),outer_b,round(inner_c,num_dec),outer_c,round(inner_d,num_dec),outer_d,radius-outer_width,radius]
					gaps = [sol[1]-sol[0],sol[3]-sol[2],sol[5]-sol[4],sol[7]-sol[6]]
					poss_sol[str(sol)] = [sol,max(gaps)-min(gaps)]

	solution = []
	diff = 12
	for key in poss_sol:
		if poss_sol[key][1] < diff:
			diff = poss_sol[key][1]
			solution = poss_sol[key][0]

	return solution

def render(measurements):
	print(measurements)

	fig, ax  = subplots()

	ax.set_xlim((-10,10))
	ax.set_ylim((-10,10))

	A = Circle((0,0), measurements[0], color='blue')
	AB = Circle((0,0), measurements[1], color='w')
	B = Circle((0,0), measurements[2], color='blue')
	BC = Circle((0,0), measurements[3], color='w')
	C = Circle((0,0), measurements[4], color='blue')
	CD = Circle((0,0), measurements[5], color='w')
	D = Circle((0,0), measurements[6], color='blue')
	DE = Circle((0,0), measurements[7], color='w')
	E = Circle((0,0), measurements[8], color='blue')

	ax.add_artist(E)
	ax.add_artist(DE)
	ax.add_artist(D)
	ax.add_artist(CD)
	ax.add_artist(C)
	ax.add_artist(BC)
	ax.add_artist(B)
	ax.add_artist(AB)
	ax.add_artist(A)

	show()


if __name__ == "__main__":

	for i in  range(1,20):
		solution = concentric_circles(0.25, i)

		if len(solution) != 0:
			print("Minimum outer radius: ", i)
			render(solution)
			# render(sols[len(sols)-1])
			break

