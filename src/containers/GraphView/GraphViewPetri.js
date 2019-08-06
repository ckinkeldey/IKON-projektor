import React, {Component} from 'react'
import {connect} from 'react-redux'
import {default as PetriDishGraph} from './PetriDish'
// import {default as AreaChart} from './AreaChart'
// import TimeGraph from './TimeLine'
// import ProjectModal from '../../components/ProjectPopover/Popover'
// import FilterModal from '../../components/FilterModal/FilterModal'
// import FilterChips from '../../components/FilterChips/FilterChips'
import classes from './GraphView.css'
import * as actions from '../../store/actions/actions'
// import Navigation from '../../components/Navigation/Navigation'
// import Aux from '../../hoc/AuxComponent/AuxComponent'
// import Statistics from '../../components/Statistics/Statistics'  

class GraphViewPetri extends Component {
  constructor (props) {
    super(props)
    this.state = {activePopover: this.props.selectedProject ? 1 : -1, height: window.innerHeight, width: window.innerWidth}
    this.changeModalHandler = this.changeModalHandler.bind(this)
    this.changeGraphHandler = this.changeGraphHandler.bind(this)
    this.projectClickHandler = this.projectClickHandler.bind(this)
  }

  componentDidMount () {
    window.addEventListener('resize', this.resize.bind(this))
    this.resize()
  }

  resize () {
    this.setState({width: window.innerWidth, height: window.innerHeight})
  }

  changeModalHandler (filter) {
    const newState = (filter === this.state.activePopover) ? -1 : filter
    this.setState({
      activePopover: newState
    })
    if (newState === -1) { this.props.deactivatePopover() }
  }

  projectClickHandler (project, vis) {
    this.props.activatePopover(project, vis)
    this.changeModalHandler(1)
  }

  changeGraphHandler (graph) {
    this.props.changeGraph(graph)
    this.setState({
      activePopover: -1
    })
  }

  render () {
    let Graph = (<PetriDishGraph/>) // render conditional according to state. Petridish rendered as default
    switch (this.props.graph) {
      case '0':
        Graph = (<PetriDishGraph height={this.state.height} width={this.state.width} onProjectClick={this.projectClickHandler}/>)
        break
      case '1':
        Graph = (<PetriDishGraph height={this.state.height} width={this.state.width} onProjectClick={this.projectClickHandler}/>)
        break
      case '2':
        Graph = (<PetriDishGraph height={this.state.height} width={this.state.width} onProjectClick={this.projectClickHandler}/>)
        break
      default:
        break
    }
    
    return (
      <div className={classes.OuterDiv}>
        
        <div className={classes.statisticsWrapper}>
          {/* <Statistics filter = {this.props.filter} filteredData={this.props.filteredData}/> */}
        </div>
        {Graph}
        {/* <FilterChips amount={this.props.filterAmount}/> */}
      </div>
    )
  }
}

const mapStateToProps = state => {
  let selectedProject
  state.main.data.forEach(project => {
    if (project.id === state.main.selectedProject) selectedProject = project
  })

  return {
    graph: state.main.graph,
    filterAmount: state.main.filter.length,
    selectedProject: state.main.selectedProject,
    selectedDataPoint: selectedProject,
    activeFilterCount: calculateActiveFilterCount(state.main.filter),
    filter: state.main.filter,
    filteredData: state.main.filteredData
  }
}

const calculateActiveFilterCount = (filter) => {
  let activeFilterCount = 0
  filter.forEach(f => { activeFilterCount += (f.distValues.length !== f.value.length ? 1 : 0) })
  return activeFilterCount
}

const mapDispatchToProps = dispatch => {
  return {
    changeGraph: (value) => dispatch(actions.changeGraph(value)),
    activatePopover: (value, vis) => dispatch(actions.activatePopover(value, vis)),
    deactivatePopover: () => dispatch(actions.deactivatePopover())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(GraphViewPetri)