all: yarr

yarr: yarr.c
	gcc -o yarr yarr.c -lraylib -lglfw -lopenal

clean:
	rm yarr
