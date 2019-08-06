import React, {Component} from 'react'
import classes from './Sidebar.css'
import {connect} from 'react-redux'
import * as actions from '../../store/actions/actions'
// import SidebarFilterElements from './SidebarFilterElements'
import SidebarFilterElementsNew from './SidebarFilterElementsNew'

class Sidebar extends Component {
  constructor (props) {
    super(props)
    const expFilters = new Array(this.props.filters.length)
    expFilters.fill(true)
    this.state = {expandedFilters: expFilters, value: '', filters: this.getNewFilters(props.filters)}
    this.handleInputChange = this.handleInputChange.bind(this)
  }

  getNewFilters (filters) {
    let newFilters = [{
      name: filters[0].name,
      filterKey: filters[0].filterKey,
      type: filters[0].type,
      subGroup: [
        {
          name: filters[0].distValues[0],
          values: filters[1].distValues.slice(0, 4)
        },
        {
          name: filters[0].distValues[1],
          values: filters[1].distValues.slice(4, 7)
        },
        {
          name: filters[0].distValues[2],
          values: filters[1].distValues.slice(7, 9)
        },
        {
          name: filters[0].distValues[3],
          values: filters[1].distValues.slice(9, 10)
        }
      ]
    },
    {
      name: filters[2].name,
      filterKey: filters[2].filterKey,
      type: filters[2].type,
      values: filters[2].distValues
    }]
    return newFilters
  }

  handleInputChange (event) {
    this.setState({value: event.target.value})
  }
  render () {  
    // console.log(this.props.filters, 'this.props.filters')      
    // console.log(this.state.filters, 'new filters')      
    // const filterElements = this.props.filters.map((filter, key) => filter.type === 'a'
    //   ? <SidebarFilterElements id={key} key={key} name={filter.name} keys={filter.distValues} value={filter.value} open={this.state.expandedFilters[key]} change={this.props.filterChangeHandler} expand={this.handleFilterExpand}/> : null)
    const filterElements = <SidebarFilterElementsNew filters={this.state.filters} change={this.props.filterChangeHandler} />
    return (
      <div className={classes.FilterModal}>
        <div className={classes.CheckBoxes}>
          {filterElements}
        </div>
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    filterChangeHandler: (filterId, value, form) => dispatch(actions.filterChange(filterId, value, form)),
    toggleAllFilters: (key, filters) => dispatch(actions.toggleAllFilters(key, filters))
  }
}

const mapStateToProps = state => {
  return {
    filters: state.main.filter
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar)