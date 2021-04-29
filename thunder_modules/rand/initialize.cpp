#include <cstdlib>

@import "chrono/chrono.cpp" as chrono

using namespace std;

bool initialized = false;

@export
void init() {
	srand(chrono::ms());
	rand();

	initialized = true;
}
@endexport
