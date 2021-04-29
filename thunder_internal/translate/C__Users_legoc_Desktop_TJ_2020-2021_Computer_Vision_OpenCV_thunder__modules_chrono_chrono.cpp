#include "../../thunder_internal/header/C__Users_legoc_Desktop_TJ_2020-2021_Computer_Vision_OpenCV_thunder__modules_chrono_chrono.cpp.hpp"
#include <chrono>namespace __thunder_file_C__Users_legoc_Desktop_TJ_2020_2021_Computer_Vision_OpenCV_thunder__modules_chrono_chrono__cpp {

using namespace std::chrono;

namespace exports {

long long ms() {
	milliseconds ms = duration_cast< milliseconds >(
			system_clock::now().time_since_epoch()
	);
}

}/*end export*/
}/*end private namespace*/
