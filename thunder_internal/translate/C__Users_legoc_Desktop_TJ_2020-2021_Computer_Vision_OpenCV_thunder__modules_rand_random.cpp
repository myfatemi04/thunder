#include "../../thunder_internal/header/C__Users_legoc_Desktop_TJ_2020-2021_Computer_Vision_OpenCV_thunder__modules_rand_random.cpp.hpp"
#include <cstdlib>#include "../header/C__Users_legoc_Desktop_TJ_2020-2021_Computer_Vision_OpenCV_thunder__modules_rand_initialize.cpp.hpp"
#define initialize __thunder_file_C__Users_legoc_Desktop_TJ_2020_2021_Computer_Vision_OpenCV_thunder__modules_rand_initialize__cpp::exports
namespace __thunder_file_C__Users_legoc_Desktop_TJ_2020_2021_Computer_Vision_OpenCV_thunder__modules_rand_random__cpp {

namespace exports {
int getRandomInteger(int min, int max) {
		initialize::init();

    int range = max - min;
    return min + range * (std::rand() / ((double) RAND_MAX));
}
}/*end export*/

namespace exports {
double getRandomDouble() {
		initialize::init();

    return std::rand() / ((double) RAND_MAX);
}
}/*end export*/
}/*end private namespace*/
