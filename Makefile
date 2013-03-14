WORKSPACE=${CURDIR}

default: jsdoc

mkjsdoc:
	mkdir -p ${WORKSPACE}/../website/documentation/jsdocs

jsdoc: mkjsdoc
	./server/node_modules/jsdoc/jsdoc -c docs/conf.json
