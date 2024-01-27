/**********************************************

Simplificacions:

- Els tags són strings, no poden haver tags repetits simultàniament
  (podem, però, fer servir un tag més d'un cop si no estan vigents a
  l'hora).

- No es poden fer servir non-local exits (continuacions, excepcions,
  etc)

Al tanto! Sí que es poden fer servir continuacions en la
*implementació* de my_catch i my_throw (de fet, no teniu més remei!),
el que vull dir és que en el codi que fa servir my_catch i/o my_throw,
no ha d'haver non-local exits. Això simplifica molt la implementació.

**********************************************/

function current_continuation() { // Sempre va bé tenir current_continuation a mà...
  return new Continuation()
}

// La definició de my_catch i my_throw

let { my_catch, my_throw } =

  ( function () {

      // ... les dades/atributs/estat necessaris (a decidir per vosaltres)
      let pila = []

      // ... les funcions auxiliars que us facin falta (a decidir per vosaltres)
      function findElement(a,t) {
        for (let i = 0; i < a.length; ++i) {
          let tag = a[i].tag
          if (tag === t) return i
        }
        return -1
      }

    function _catch(tag, fun) {
      const found = findElement(pila,tag)
      if (found === -1) pila.push({'tag': tag, 'cont': current_continuation()})
      else throw("No es permeten tags repetits")
      if (pila[pila.length-1].cont instanceof Continuation) {
        let val = fun()
        pila.pop()
        return val

      }
      else {
        return pila.pop().cont
      }

    }

      function _throw(tag, val) {
          // Pre: tag és una String; val és qualsevol valor (però no una Continuation!)
          // ...
          const index = findElement(pila,tag)
          if (index !== -1) {
            let c = pila[index].cont
            pila.splice(index, pila.length)
            c(val)
          }
          else {
            throw("my_throw no tiene my_catch")
          }

      }

      return { my_catch: _catch, my_throw: _throw }

  }())

// Els exemples de l'enunciat:

// a/

print(my_catch('etiqueta',function () { return 2 + 3 * 100 })) // ==> escriu 302
print(my_catch('etiqueta',function () {return 2 + 3 * my_throw('etiqueta',100)})) // ==> escriu 100

// b/

function test(x) {
  return 2 + 3 * (x === 0 ? my_throw('etiqueta',100) : 100)
}

print(my_catch('etiqueta', function() { return test(1) }))  // escriurà 302

print(my_catch('etiqueta', function() { return test(0) }))  // escriurà 100


try {
  print(test(0))
} catch (error) {
  print(error)
}

// c

function getRandomInt(max) {
return Math.floor(Math.random() * max);
}

function check(x) {
  if (x === 0) {
      my_throw('zero','zero')
  } else if (x === 1) {
      my_throw('one','one')
  }
  return x
}


print(my_catch('zero',function() {
  for (let i = 0; i < 10; i++) {
    print(my_catch('one', function () { return check(getRandomInt(5)) }) )}
  return 'finito'
}))


// d
try {
  my_throw('etiqueta', 100);
} catch (error) {
  print(error); // Debería imprimir "my_throw no tiene my_catch"
}

// e -> Hauría d'imprimir 100
print(my_catch('zero', function () {
  return my_catch('one', function () {
    return my_catch('two', function () {
      return my_throw('one', 100);
    });
  });
})); 


// f -> Hauría d'imprimir l'error del throw(tags repetits)
try {
  print(my_catch('zero', function () {
    return my_catch('zero', function () {
      return my_catch('two', function () {
        return my_throw('one', 100);
      });
    });
  })); 
}catch(error) {
  print(error)
}

