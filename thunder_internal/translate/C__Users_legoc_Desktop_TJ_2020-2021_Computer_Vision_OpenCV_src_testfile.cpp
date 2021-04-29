#include "../../thunder_internal/header/C__Users_legoc_Desktop_TJ_2020-2021_Computer_Vision_OpenCV_src_testfile.cpp.hpp"
namespace __thunder_file_C__Users_legoc_Desktop_TJ_2020_2021_Computer_Vision_OpenCV_src_testfile__cpp {
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

namespace exports {

int factorial(int value) {
	if (!checkFactorial(value)) {
		return -1;
	} else { 
		return _factorial(value);
	}
}

}/*end export*/
}/*end private namespace*/
