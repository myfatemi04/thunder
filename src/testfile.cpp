int secretNumber = 0;

int _factorial(int n) {
	int value = 1;
	while (n > 1) {
		value *= (n--);
	}
	return value;
}

bool checkFactorial(int value) {
	if (value < 0 || value > 100) {
		return false;
	} else {
		return true;
	}
}

@export

int factorial(int value) {
	if (!checkFactorial(value)) {
		return -1;
	} else { 
		return _factorial(value);
	}
}

@endexport
