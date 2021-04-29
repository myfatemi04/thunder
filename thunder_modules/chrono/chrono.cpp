#include <chrono>

using namespace std::chrono;

@export

long long ms() {
	milliseconds ms = duration_cast< milliseconds >(
			system_clock::now().time_since_epoch()
	);
}

@endexport
