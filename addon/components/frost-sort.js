/* globals sortOrder properties */
import Ember from 'ember'
import PropTypesMixin, { PropTypes } from 'ember-prop-types'
import computed, { oneWay } from 'ember-computed-decorators'
import layout from '../templates/components/frost-sort'

const {
  A,
  Component,
  deprecate,
  isEmpty,
  run
} = Ember

const {
  scheduleOnce
} = run

export default Component.extend(PropTypesMixin, {
  layout: layout,
  classNames: ['frost-sort'],

  propTypes: {
    hook: PropTypes.string,
    maxActiveSortRules: PropTypes.number,
    sortOrder: PropTypes.array,
    properties: PropTypes.array
  },

  getDefaultProps () {
    return {
      hook: 'sort',
      properties: A(),
      sortOrder: A()
    }
  },

  init () {
    this._super(...arguments)
    deprecate(
      'sortParams has been deprecated in favor of sortOrder',
      !this.get('sortParams'),
      {
        id: 'frost-sort.deprecate-sort-params',
        until: '3.0.0'
      }
    )
    deprecate(
      'sortableProperties has been deprecated in favor of properties.',
      !this.get('sortableProperties'),
      {
        id: 'frost-sort.deprecate-sortable-properties',
        until: '3.0.0'
      }
    )
    scheduleOnce('afterRender', this, function () {
      let props = this.get('properties')
      let order = this.get('sortOrder')
      if (isEmpty(order) && props.get('firstObject')) {
        this.onChange([`${props.get('firstObject.value')}:asc`])
        // this.send('sortArrayChange', {
        //   id: 1,
        //   direction: ':asc',
        //   value: props.get('firstObject.value')
        // })
      }
    })
  },

  @oneWay('sortParams') sortOrder,
  @oneWay('sortableProperties') properties,

  @computed('sortOrder.[]')
  hideRemoveButton(sortOrder) {
    return sortOrder.length === 1
  }

  // @computed('filterArray.@each.value')
  // hideRemoveButton () {
  //   return this.get('filterArray').length > 1
  // },

  @computed('maxActiveSortRules', 'properties', 'sortOrder.[]')
  hideAddButton (maxActiveSortRules, properties, sortOrder) {
    return properties.length === sortOrder.length || maxActiveSortRules <= sortOrder.length
  },

  // @computed()
  // filterArray () {
  //   let sortOrder = this.get('sortOrder')
  //   if (isEmpty(sortOrder)) {
  //     return sortOrder
  //   } else {
  //     return sortOrder.map((param, i) => {
  //       let id = this.get('elementId')
  //       return Ember.Object.create({
  //         id: `${id}_${i + 1}`,
  //         value: param.value,
  //         direction: param.direction
  //       })
  //     })
  //   }
  // },

  @computed('sortOrder.[]')
  unselectedOptions () {
    if (isEmpty(this.get('sortOrder'))) {
      return this.get('properties')
    }

    const selectedOptions = this.get('sortOrder').map((sortOrderItem) => {
      return sortOrderItem.split(':')[0]
    })
    return this.get('properties').filter((item) => {
      return selectedOptions.indexOf(item.value) < 0
    })
  },

  actions: {
    addFilter () {
      // if (this.get('filterArray').length > this.get('properties').length) {
      //   return
      // }
      // this.get('filterArray').addObject(Ember.Object.create({
      //   id: this.get('filterArray').length + 1,
      //   value: '',
      //   direction: ':asc'
      // }))
      this.onChange(this.get('sortOrder').concat([`:asc`]))
    },

    removeFilter (index) {
      const sortOrder = this.get('sortOrder')
      this.onChange(sortOrder.slice(0, index).concat(sortOrder.slice(index + 1)))
      // let filterArray = this.get('filterArray')
      // if (filterArray.length > 1) {
      //   let newFilter = filterArray
      //     .filter(obj => obj.id !== sortItemId)
      //     .map((item, index) => {
      //       item.set('id', index)
      //       return item
      //     })
      //   this.set('filterArray', newFilter)
      //   this.get('onChange')(this.get('filterArray'))
      // }
    },

    sortArrayChange (index, sortOrderItem) {
      // let filterArray = this.get('filterArray')
      // filterArray.findBy('id', attrs.id).setProperties({
      //   value: attrs.value,
      //   direction: attrs.direction
      // })
      const sortOrder = this.get('sortOrder')
      this.onChange(
        sortOrder.slice(0, index)
        .concat(sortOrderItem)
        .concat(sortOrder.slice(index + 1))
      )
    }
  }
})
