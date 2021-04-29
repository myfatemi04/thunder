#include <iostream>
@import "./shared_value.cpp" as shared
@import "rand/random.cpp" as random

@global
int main() {
	std::cout << "My number is " << random::getRandomDouble() << '\n';
}
@endglobal
