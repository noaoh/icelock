import { it, describe, expect } from 'vitest'
import { icelock } from '../icelock'
import { cloneDeep } from 'lodash-es'

describe('icelock', () => {
  it('should throw an error if passed null', () => {
    expect(() => icelock(null as unknown as any)).toThrowError('Cannot freeze null.')
  })

  describe('Object', () => {
    it('should freeze an object', () => {
      const { iced, freeze, unfreeze } = icelock({ a: 1, b: 2 })
      expect(iced).toBeInstanceOf(Object)
      expect(freeze).toBeInstanceOf(Function)
      expect(unfreeze).toBeInstanceOf(Function)
    })

    it('should throw an error when trying to set a property on a frozen object', () => {
      const { iced } = icelock({ a: 1, b: 2 })
      // eslint-disable-next-line no-return-assign
      expect(() => iced.c = 3).toThrowError('Cannot set c, object is frozen.')
    })

    it('should throw an error when trying to delete a property on a frozen object', () => {
      const { iced } = icelock({ a: 1, b: 2 })
      expect(() => delete iced.a).toThrowError('Cannot delete a, object is frozen.')
    })

    it('should allow setting a property on a thawed object', () => {
      const { iced, unfreeze } = icelock({ a: 1, b: 2 })
      unfreeze()
      iced.c = 3
      expect(iced.c).toBe(3)
    })

    it('should allow deleting a property on a thawed object', () => {
      const { iced, unfreeze } = icelock({ a: 1, b: 2 })
      unfreeze()
      delete iced.a
      expect(iced.a).toBeUndefined()
    })

    it('should allow setting a property on a cloned frozen object', () => {
      const { iced, freeze } = icelock({ a: 1, b: 2 })
      freeze()
      const thawed = cloneDeep(iced)
      thawed.c = 3
      expect(thawed.c).toBe(3)
    })

    it('should allow deleting a property on a cloned frozen object', () => {
      const { iced } = icelock({ a: 1, b: 2 })
      const thawed = cloneDeep(iced)
      delete thawed.a
      expect(thawed.a).toBeUndefined()
    })

    it('should allow refreezing a thawed object', () => {
      const { iced, unfreeze, freeze } = icelock({ a: 1, b: 2 })
      unfreeze()
      iced.c = 3
      freeze()
      // eslint-disable-next-line no-return-assign
      expect(() => iced.d = 4).toThrowError('Cannot set d, object is frozen.')
    })

    it('should prevent setting a property on a nested object', () => {
      const { iced } = icelock({ a: { b: 1 } })
      // eslint-disable-next-line no-return-assign
      expect(() => iced.a.b = 2).toThrowError('Cannot set b, object is frozen.')
    })

    it('should prevent deleting a property on a nested object', () => {
      const { iced } = icelock({ a: { b: 1 } })
      expect(() => delete iced.a.b).toThrowError('Cannot delete b, object is frozen.')
    })

    it('should allow setting a property on a nested object when thawed', () => {
      const { iced, unfreeze } = icelock({ a: { b: 1 } })
      unfreeze()
      iced.a.b = 2
      expect(iced.a.b).toBe(2)
    })

    it('should allow deleting a property on a nested object when thawed', () => {
      const { iced, unfreeze } = icelock({ a: { b: 1 } })
      unfreeze()
      delete iced.a.b
      expect(iced.a.b).toBeUndefined()
    })
  })

  describe('Map', () => {
    it('should freeze a map', () => {
      const { iced, freeze, unfreeze } = icelock(new Map([['a', 1], ['b', 2]]))
      expect(iced).toBeInstanceOf(Map)
      expect(freeze).toBeInstanceOf(Function)
      expect(unfreeze).toBeInstanceOf(Function)
    })

    it('should throw an error when trying to set a property on a frozen map', () => {
      const { iced } = icelock(new Map([['a', 1], ['b', 2]]))
      expect(() => iced.set('c', 3)).toThrowError('Cannot set c, map is frozen.')
    })

    it('should throw an error when trying to delete a property on a frozen map', () => {
      const { iced } = icelock(new Map([['a', 1], ['b', 2]]))
      expect(() => iced.delete('a')).toThrowError('Cannot delete a, map is frozen.')
    })

    it('should throw an error when trying to clear a frozen map', () => {
      const { iced } = icelock(new Map([['a', 1], ['b', 2]]))
      expect(() => iced.clear()).toThrowError('Cannot clear map, map is frozen.')
    })

    it('should allow accessing a key on a frozen map', () => {
      const { iced } = icelock(new Map([['a', 1], ['b', 2]]))
      expect(iced.get('a')).toBe(1)
    })

    it('should allow getting the size of a frozen map', () => {
      const { iced } = icelock(new Map([['a', 1], ['b', 2]]))
      expect(iced.size).toBe(2)
    })

    it('should allow setting a key on a thawed map', () => {
      const { iced, unfreeze } = icelock(new Map([['a', 1], ['b', 2]]))
      unfreeze()
      iced.set('c', 3)
      expect(iced.get('c')).toBe(3)
    })

    it('should allow deleting a key on a thawed map', () => {
      const { iced, unfreeze } = icelock(new Map([['a', 1], ['b', 2]]))
      unfreeze()
      iced.delete('a')
      expect(iced.get('a')).toBeUndefined()
    })

    it('should allow clearing a thawed map', () => {
      const { iced, unfreeze } = icelock(new Map([['a', 1], ['b', 2]]))
      unfreeze()
      iced.clear()
      expect(iced.size).toBe(0)
    })

    it('should allow refreezing a thawed map', () => {
      const { iced, unfreeze, freeze } = icelock(new Map([['a', 1], ['b', 2]]))
      unfreeze()
      iced.set('c', 3)
      freeze()
      expect(() => iced.set('d', 4)).toThrowError('Cannot set d, map is frozen.')
    })

    it('should prevent setting a key on a nested map', () => {
      const { iced } = icelock(new Map([['a', new Map([['b', 1]])]]))
      expect(() => iced.get('a').set('c', 2)).toThrowError('Cannot set c, map is frozen.')
    })

    it('should prevent deleting a key on a nested map', () => {
      const { iced } = icelock(new Map([['a', new Map([['b', 1]])]]))
      expect(() => iced.get('a').delete('b')).toThrowError('Cannot delete b, map is frozen.')
    })

    it('should prevent clearing a nested map', () => {
      const { iced } = icelock(new Map([['a', new Map([['b', 1]])]]))
      expect(() => iced.get('a').clear()).toThrowError('Cannot clear map, map is frozen.')
    })

    it('should allow setting a key on a nested map when thawed', () => {
      const { iced, unfreeze } = icelock(new Map([['a', new Map([['b', 1]])]]))
      unfreeze()
      iced.get('a').set('c', 2)
      expect(iced.get('a').get('c')).toBe(2)
    })

    it('should allow deleting a key on a nested map when thawed', () => {
      const { iced, unfreeze } = icelock(new Map([['a', new Map([['b', 1]])]]))
      unfreeze()
      iced.get('a').delete('b')
      expect(iced.get('a').get('b')).toBeUndefined()
    })

    it('should allow clearing a nested map when thawed', () => {
      const { iced, unfreeze } = icelock(new Map([['a', new Map([['b', 1]])]]))
      unfreeze()
      iced.get('a').clear()
      expect(iced.get('a').size).toBe(0)
    })
  })

  describe('Array', () => {
    it('should freeze an array', () => {
      const { iced, freeze, unfreeze } = icelock([1, 2])
      expect(iced).toBeInstanceOf(Array)
      expect(freeze).toBeInstanceOf(Function)
      expect(unfreeze).toBeInstanceOf(Function)
    })

    it('should throw an error when trying to set a property on a frozen array', () => {
      const { iced } = icelock([1, 2])
      // eslint-disable-next-line no-return-assign
      expect(() => iced[2] = 3).toThrowError('Cannot set 2, array is frozen.')
    })

    it('should throw an error when trying to pop on a frozen array', () => {
      const { iced } = icelock([1, 2])
      expect(() => iced.pop()).toThrowError('Cannot pop, array is frozen.')
    })

    it('should throw an error when trying to push on a frozen array', () => {
      const { iced } = icelock([1, 2])
      expect(() => iced.push(3)).toThrowError('Cannot push 3, array is frozen.')
    })

    it('should throw an error when trying to splice on a frozen array', () => {
      const { iced } = icelock([1, 2])
      expect(() => iced.splice(0, 1)).toThrowError('Cannot splice 0, 1, array is frozen.')
    })

    it('should allow accessing an index on a frozen array', () => {
      const { iced } = icelock([1, 2])
      expect(iced[0]).toBe(1)
    })

    it('should allow getting the length of a frozen array', () => {
      const { iced } = icelock([1, 2])
      expect(iced.length).toBe(2)
    })

    it('should allow setting an index on a thawed array', () => {
      const { iced, unfreeze } = icelock([1, 2])
      unfreeze()
      iced[2] = 3
      expect(iced[2]).toBe(3)
    })

    it('should allow popping on a thawed array', () => {
      const { iced, unfreeze } = icelock([1, 2])
      unfreeze()
      iced.pop()
      expect(iced.length).toBe(1)
    })

    it('should allow pushing on a thawed array', () => {
      const { iced, unfreeze } = icelock([1, 2])
      unfreeze()
      iced.push(3)
      expect(iced.length).toBe(3)
    })

    it('should allow splicing on a thawed array', () => {
      const { iced, unfreeze } = icelock([1, 2])
      unfreeze()
      iced.splice(0, 1)
      expect(iced.length).toBe(1)
    })

    it('should allow refreezing a thawed array', () => {
      const { iced, unfreeze, freeze } = icelock([1, 2])
      unfreeze()
      iced.push(3)
      freeze()
      expect(() => iced.push(4)).toThrowError('Cannot push 4, array is frozen.')
    })

    it('should prevent setting an index on a nested array', () => {
      const { iced } = icelock([1, [2]])
      // eslint-disable-next-line no-return-assign
      expect(() => iced[1][0] = 3).toThrowError('Cannot set 0, array is frozen.')
    })

    it('should prevent popping on a nested array', () => {
      const { iced } = icelock([1, [2]])
      expect(() => iced[1].pop()).toThrowError('Cannot pop, array is frozen.')
    })

    it('should prevent pushing on a nested array', () => {
      const { iced } = icelock([1, [2]])
      expect(() => iced[1].push(3)).toThrowError('Cannot push 3, array is frozen.')
    })

    it('should prevent splicing on a nested array', () => {
      const { iced } = icelock([1, [2]])
      expect(() => iced[1].splice(0, 1)).toThrowError('Cannot splice 0, 1, array is frozen.')
    })

    it('should allow setting an index on a nested array when thawed', () => {
      const { iced, unfreeze } = icelock([1, [2]])
      unfreeze()
      iced[1][0] = 3
      expect(iced[1][0]).toBe(3)
    })

    it('should allow popping on a nested array when thawed', () => {
      const { iced, unfreeze } = icelock([1, [2]])
      unfreeze()
      iced[1].pop()
      expect(iced[1].length).toBe(0)
    })

    it('should allow pushing on a nested array when thawed', () => {
      const { iced, unfreeze } = icelock([1, [2]])
      unfreeze()
      iced[1].push(3)
      expect(iced[1].length).toBe(2)
    })

    it('should allow splicing on a nested array when thawed', () => {
      const { iced, unfreeze } = icelock([1, [2]])
      unfreeze()
      iced[1].splice(0, 1)
      expect(iced[1].length).toBe(0)
    })
  })

  describe('Set', () => {
    it('should freeze a set', () => {
      const { iced, freeze, unfreeze } = icelock(new Set([1, 2]))
      expect(iced).toBeInstanceOf(Set)
      expect(freeze).toBeInstanceOf(Function)
      expect(unfreeze).toBeInstanceOf(Function)
    })

    it('should throw an error when trying to add to a frozen set', () => {
      const { iced } = icelock(new Set([1, 2]))
      expect(() => iced.add(3)).toThrowError('Cannot add 3, set is frozen.')
    })

    it('should throw an error when trying to delete from a frozen set', () => {
      const { iced } = icelock(new Set([1, 2]))
      expect(() => iced.delete(1)).toThrowError('Cannot delete 1, set is frozen.')
    })

    it('should throw an error when trying to clear a frozen set', () => {
      const { iced } = icelock(new Set([1, 2]))
      expect(() => iced.clear()).toThrowError('Cannot clear set, set is frozen.')
    })

    it('should allow checking a value on a frozen set', () => {
      const { iced } = icelock(new Set([1, 2]))
      expect(iced.has(1)).toBe(true)
    })

    it('should allow getting the size of a frozen set', () => {
      const { iced } = icelock(new Set([1, 2]))
      expect(iced.size).toBe(2)
    })

    it('should allow adding to a thawed set', () => {
      const { iced, unfreeze } = icelock(new Set([1, 2]))
      unfreeze()
      iced.add(3)
      expect(iced.has(3)).toBe(true)
    })

    it('should allow deleting from a thawed set', () => {
      const { iced, unfreeze } = icelock(new Set([1, 2]))
      unfreeze()
      iced.delete(1)
      expect(iced.has(1)).toBe(false)
    })

    it('should allow clearing a thawed set', () => {
      const { iced, unfreeze } = icelock(new Set([1, 2]))
      unfreeze()
      iced.clear()
      expect(iced.size).toBe(0)
    })

    it('should allow refreezing a thawed set', () => {
      const { iced, unfreeze, freeze } = icelock(new Set([1, 2]))
      unfreeze()
      iced.add(3)
      freeze()
      expect(() => iced.add(4)).toThrowError('Cannot add 4, set is frozen.')
    })

    it('should prevent adding to a nested set', () => {
      const { iced } = icelock(new Set([new Set([1])]))
      expect(() => iced.values().next().value.add(2)).toThrowError('Cannot add 2, set is frozen.')
    })

    it('should prevent deleting from a nested set', () => {
      const { iced } = icelock(new Set([new Set([1])]))
      expect(() => iced.values().next().value.delete(1)).toThrowError('Cannot delete 1, set is frozen.')
    })

    it('should prevent clearing a nested set', () => {
      const { iced } = icelock(new Set([new Set([1])]))
      expect(() => iced.values().next().value.clear()).toThrowError('Cannot clear set, set is frozen.')
    })

    it('should allow adding to a nested set when thawed', () => {
      const { iced, unfreeze } = icelock(new Set([new Set([1])]))
      unfreeze()
      iced.values().next().value.add(2)
      expect(iced.values().next().value.has(2)).toBe(true)
    })

    it('should allow deleting from a nested set when thawed', () => {
      const { iced, unfreeze } = icelock(new Set([new Set([1])]))
      unfreeze()
      iced.values().next().value.delete(1)
      expect(iced.values().next().value.has(1)).toBe(false)
    })

    it('should allow clearing a nested set when thawed', () => {
      const { iced, unfreeze } = icelock(new Set([new Set([1])]))
      unfreeze()
      iced.values().next().value.clear()
      expect(iced.values().next().value.size).toBe(0)
    })
  })

  describe('Options', () => {
    it('should freeze an object by default', () => {
      const { iced } = icelock({ a: 1, b: 2 })
      // eslint-disable-next-line no-return-assign
      expect(() => iced.c = 3).toThrowError('Cannot set c, object is frozen.')
    })

    it('should have an unfrozen object when isFrozen is false', () => {
      const { iced } = icelock({ a: 1, b: 2 }, { isFrozen: false })
      iced.c = 3
      expect(iced.c).toBe(3)
    })

    it('should have a frozen object when isFrozen is true', () => {
      const { iced } = icelock({ a: 1, b: 2 }, { isFrozen: true })
      // eslint-disable-next-line no-return-assign
      expect(() => iced.c = 3).toThrowError('Cannot set c, object is frozen.')
    })
  })
})
