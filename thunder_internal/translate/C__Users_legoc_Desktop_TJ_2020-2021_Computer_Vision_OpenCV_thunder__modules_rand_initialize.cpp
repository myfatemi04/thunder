#include "../../thunder_internal/header/C__Users_legoc_Desktop_TJ_2020-2021_Computer_Vision_OpenCV_thunder__modules_rand_initialize.cpp.hpp"
#include <cstdlib>namespace __thunder_file_C__Users_legoc_Desktop_TJ_2020_2021_Computer_Vision_OpenCV_thunder__modules_rand_initialize__cpp {

}/*end private namespace*/
#include "../header/C__Users_legoc_Desktop_TJ_2020-2021_Computer_Vision_OpenCV_thunder__modules_chrono_chrono.cpp.hpp"
#define chrono __thunder_file_C__Users_legoc_Desktop_TJ_2020_2021_Computer_Vision_OpenCV_thunder__modules_chrono_chrono__cpp::exports
namespace __thunder_file_C__Users_legoc_Desktop_TJ_2020_2021_Computer_Vision_OpenCV_thunder__modules_rand_initialize__cpp {

using namespace std;

bool initialized = false;

namespace exports {
void init() {
	srand(chrono::ms());
	rand();

	initialized = true;
}
}/*end export*/
}/*end private namespace*/
