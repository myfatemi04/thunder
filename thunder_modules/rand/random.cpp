#include <cstdlib>
@import "./initialize.cpp" as initialize

@export
int getRandomInteger(int min, int max) {
		initialize::init();

    int range = max - min;
    return min + range * (std::rand() / ((double) RAND_MAX));
}
@endexport

@export
double getRandomDouble() {
		initialize::init();

    return std::rand() / ((double) RAND_MAX);
}
@endexport
