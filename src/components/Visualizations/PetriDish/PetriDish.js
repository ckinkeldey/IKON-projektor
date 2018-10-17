import React, {Component} from 'react'
import * as d3 from 'd3'

class PetriDish extends Component {
  constructor (props) {
    super(props)
    let projects = []
    for (let i = 0; i < nlpDump.data.points.length; i++) {
      projects.push({point: nlpDump.data.points[i], cluster: nlpDump.data.clusters[i]})
    }
    this.state = {
      nlpProjectsDump: projects, // TODO: Change from the static dump data below to the API
      width: 0,
      height: 0
    }
    this.updateHulls = this.updateHulls.bind(this)
  }

  updateData (data, width, height) {
    this.setState({data, width, height})
  }

  render () {
    this.updateHulls()
    return <div>
      <div id={'clusterContainer'} width={this.state.width} height={this.state.height} ></div>
    </div>
  }

  handleClusterClick (points) {
    // TODO
    alert(`Cluster clicked`)
  }

  handleMouseMoveOnCluster (points) {
    // TODO integrate hoverPopup same as in the map and the timeline
  }

  updateHulls () {
    let width = this.state.width
    let height = this.state.height

    // TODO scale as needed
    let scale = 100
    let offsetY = 0.5 * height
    let offsetX = 0.5 * width

    let clusters = []
    this.state.nlpProjectsDump.forEach(value => {
      if (clusters[value.cluster]) {
        clusters[value.cluster].push([(value.point[0] * scale + offsetX), (value.point[1] * scale + offsetY)])
      } else {
        clusters[value.cluster] = []
      }
    })

    let container = d3.select('#clusterContainer')
    container.selectAll('*').remove()
    let svg = container.append('svg').attr('width', width)
      .attr('id', 'cluster-svg')
      .attr('height', height)

    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'none')

    clusters.forEach((points, index) => {
      let clusterId = index
      if (points.length >= 3) { // d3.polygonHull requires at least 3 data points
        let randomColor = randomRgba()
        let hull = svg.append('path')
          .attr('id', `cluster-hull-${clusterId}`)
          .attr('class', 'hull')
          .attr('fill', randomColor)
          .attr('rx', '20') // rounded rect
          .attr('ry', '20') // rounded rect
          .style('stroke', randomColor)
          .style('stroke-width', '2em')
          .attr('stroke-linejoin', 'round')
          .attr('stroke-offset', '20')
          .attr('opacity', '0.6')
          .style('cursor', 'pointer')
          .on('mouseenter', (e) => {
            // Bring the cluster to the foreground when mouse enters it
            let clusterPathElement = document.getElementById(`cluster-hull-${clusterId}`)
            let clusterPoints = document.getElementsByClassName(`cluster-point-${clusterId}`)
            let n = 0
            while (n < clusterPoints.length / 2) { // workaround for bringing all data points and the hull to the foreground
              for (let i = 0; i < clusterPoints.length; i++) {
                document.getElementById('cluster-svg').appendChild(clusterPoints[i])
              }
              document.getElementById('cluster-svg').insertBefore(clusterPathElement, clusterPoints[0])
              n++
            }
          })
          .on('mousemove', (points) => {
            hull.attr('opacity', '1')
            this.handleMouseMoveOnCluster(points)
          })
          .on('mouseleave', (points) => {
            hull.attr('opacity', '0.6')
          })
          .on('click', (points) => this.handleClusterClick(clusterId, points))

        let polygon = d3.polygonHull(points)

        hull.datum(polygon).attr('d', function (d) {
          return 'M' + d.join('L') + 'Z'
        })

        // Use this in case you want to display a text in the hull:
        // let text = svg.append('text').text('Hull Title').attr('text-anchor', 'middle')
        // text.attr('transform', 'translate(' + d3.polygonCentroid(polygon) + ')').raise()

        points.forEach(point => {
          svg.append('circle')
            .attr('class', `cluster-point-${clusterId}`)
            .attr('id', `cluster-point-${point[0]},${point[1]}`)
            .attr('cx', point[0])
            .attr('cy', point[1])
            .attr('r', 6)
            .style('fill', randomColor)
            .style('stroke', 'white')
            .style('stroke-width', 2.5)
            .style('cursor', 'pointer')
            .on('mousemove', (points) => {
              hull.attr('opacity', '1')
              this.handleMouseMoveOnCluster(points)
            })
            .on('mouseleave', (points) => {
              hull.attr('opacity', '0.6')
            })
        })
      }
    })
  }

  componentDidMount () {
    this.updateHulls()
  }
}

const randomRgba = () => {
  let o = Math.round
  let r = Math.random
  let s = 255
  return 'rgba(' + o(r() * s) + ',' + o(r() * s) + ',' + o(r() * s) + ', 1' + ')'
}

// TODO replace data here
const nlpDump = {
  'params': {
    'targetDim': 2,
    'dimreduction': 'LSA',
    'clustering': 'KMEANS',
    'embedding': 'tSNE',
    'num_topics': 48,
    'num_clusters': 4,
    'perplexity': 22,
    'learning_rate': 9
  },
  'data': {
    'points': [
      [
        -0.34927356243133545,
        -0.014920850284397602
      ],
      [
        1.5276529788970947,
        -0.5603914260864258
      ],
      [
        -2.0931966304779053,
        0.05545071139931679
      ],
      [
        0.2479540854692459,
        -0.15572547912597656
      ],
      [
        0.9192953705787659,
        -0.588083803653717
      ],
      [
        -1.3992348909378052,
        -0.46995556354522705
      ],
      [
        -0.03382442519068718,
        -1.6926788091659546
      ],
      [
        -2.109048366546631,
        -0.32768529653549194
      ],
      [
        -0.15393862128257751,
        -2.0154967308044434
      ],
      [
        -1.4883931875228882,
        -1.5867122411727905
      ],
      [
        -0.3908977210521698,
        -0.8671339750289917
      ],
      [
        0.7596418261528015,
        0.023378774523735046
      ],
      [
        -0.10081028193235397,
        -0.5086859464645386
      ],
      [
        -0.17288875579833984,
        0.44898828864097595
      ],
      [
        -0.34934717416763306,
        -0.014906803146004677
      ],
      [
        -0.38540494441986084,
        1.2827709913253784
      ],
      [
        -0.7173460721969604,
        -1.2676677703857422
      ],
      [
        -0.8875232934951782,
        -0.3030621111392975
      ],
      [
        -0.18998634815216064,
        0.47091323137283325
      ],
      [
        -0.8360999822616577,
        -1.93031644821167
      ],
      [
        0.06791990250349045,
        1.0706944465637207
      ],
      [
        -0.9174714088439941,
        -1.6126996278762817
      ],
      [
        -0.239497110247612,
        0.32484689354896545
      ],
      [
        -1.7318302392959595,
        1.2040108442306519
      ],
      [
        1.2719743251800537,
        -0.650280237197876
      ],
      [
        -0.4992886185646057,
        0.6218662261962891
      ],
      [
        -0.7163060307502747,
        -0.9850545525550842
      ],
      [
        -0.3493725061416626,
        -0.014818205498158932
      ],
      [
        0.23898270726203918,
        -0.3233128786087036
      ],
      [
        0.1423725187778473,
        -0.6532292366027832
      ],
      [
        -1.03364896774292,
        0.9068527221679688
      ],
      [
        -0.5066845417022705,
        -0.5125179886817932
      ],
      [
        -0.8092784285545349,
        0.28786763548851013
      ],
      [
        -1.8103420734405518,
        -0.15058764815330505
      ],
      [
        0.44068634510040283,
        -0.3884633183479309
      ],
      [
        -0.34934714436531067,
        -0.014906794764101505
      ],
      [
        1.370653748512268,
        0.7222403287887573
      ],
      [
        1.5750226974487305,
        -0.050143372267484665
      ],
      [
        0.6699213981628418,
        -1.302953839302063
      ],
      [
        -0.6119496822357178,
        -0.45090511441230774
      ],
      [
        -0.34927356243133545,
        -0.01492084190249443
      ],
      [
        0.49248751997947693,
        1.6364191770553589
      ],
      [
        0.19950871169567108,
        0.3671007454395294
      ],
      [
        0.4649057984352112,
        0.2654295563697815
      ],
      [
        0.0420929379761219,
        -0.2855333983898163
      ],
      [
        0.06574308127164841,
        -1.2223795652389526
      ],
      [
        0.06751099228858948,
        1.3879281282424927
      ],
      [
        -0.8417418003082275,
        1.1618925333023071
      ],
      [
        -0.8845199942588806,
        0.27144181728363037
      ],
      [
        -0.8885342478752136,
        0.013811971060931683
      ],
      [
        -1.4948757886886597,
        -1.4710341691970825
      ],
      [
        -0.7220447063446045,
        -0.41862428188323975
      ],
      [
        0.19162523746490479,
        -0.1726803034543991
      ],
      [
        -0.34927356243133545,
        -0.01492084376513958
      ],
      [
        -1.5829496383666992,
        1.4575304985046387
      ],
      [
        0.30626481771469116,
        0.6379441022872925
      ],
      [
        0.6123263239860535,
        -1.0581594705581665
      ],
      [
        1.1834535598754883,
        0.21332313120365143
      ],
      [
        -1.2566043138504028,
        1.417656421661377
      ],
      [
        0.2874576151371002,
        -0.08763612806797028
      ],
      [
        -1.4745887517929077,
        -1.0098371505737305
      ],
      [
        -1.8837409019470215,
        -0.797014594078064
      ],
      [
        -0.23428595066070557,
        0.6407190561294556
      ],
      [
        -0.34927356243133545,
        -0.01492082979530096
      ],
      [
        -2.038649559020996,
        0.8945596814155579
      ],
      [
        -1.362760305404663,
        0.41049903631210327
      ],
      [
        0.6936954855918884,
        1.4861410856246948
      ],
      [
        -1.5146600008010864,
        -0.8351093530654907
      ],
      [
        -0.34934714436531067,
        -0.014906797558069229
      ],
      [
        -0.34934717416763306,
        -0.014906790107488632
      ],
      [
        -2.1664137840270996,
        -0.8332427144050598
      ],
      [
        -0.27639877796173096,
        -1.1356486082077026
      ],
      [
        -0.34934714436531067,
        -0.014906797558069229
      ],
      [
        -0.34934714436531067,
        -0.014906794764101505
      ],
      [
        -0.34927356243133545,
        -0.014920832589268684
      ],
      [
        -0.5328102707862854,
        0.8011941909790039
      ],
      [
        -0.9507266283035278,
        0.37393853068351746
      ],
      [
        0.37908023595809937,
        -1.5872572660446167
      ],
      [
        -0.9263078570365906,
        -0.033708054572343826
      ],
      [
        -0.8888027667999268,
        0.5355511903762817
      ],
      [
        -0.34927356243133545,
        -0.01492084190249443
      ],
      [
        -2.276564121246338,
        0.27216637134552
      ],
      [
        -1.2613754272460938,
        0.10825537145137787
      ],
      [
        -0.34548768401145935,
        0.5059013366699219
      ],
      [
        -0.34927356243133545,
        -0.01492082979530096
      ],
      [
        -0.5533188581466675,
        1.7179081439971924
      ],
      [
        0.1959916055202484,
        0.7110127806663513
      ],
      [
        -0.34927356243133545,
        -0.01492082979530096
      ],
      [
        0.8812201023101807,
        -0.8299713730812073
      ],
      [
        -1.5087798833847046,
        0.3223845064640045
      ],
      [
        0.23640981316566467,
        0.5484790205955505
      ],
      [
        -0.5804087519645691,
        -0.6065729856491089
      ],
      [
        0.40426844358444214,
        0.10236894339323044
      ],
      [
        -0.037841662764549255,
        -0.2080172300338745
      ],
      [
        -1.001368761062622,
        1.7625528573989868
      ],
      [
        -0.8650974631309509,
        -0.9445942044258118
      ],
      [
        -0.5620914697647095,
        -0.44849130511283875
      ],
      [
        0.12695960700511932,
        1.8577438592910767
      ],
      [
        -1.239221453666687,
        -0.22182941436767578
      ],
      [
        -0.32032066583633423,
        1.2015849351882935
      ],
      [
        -0.9853544235229492,
        -0.712232232093811
      ],
      [
        0.9462597966194153,
        0.6554945707321167
      ],
      [
        -1.3492743968963623,
        0.847780704498291
      ],
      [
        -0.0206886138767004,
        -0.8007926940917969
      ],
      [
        -1.235189437866211,
        -0.23286210000514984
      ],
      [
        -0.4653463363647461,
        1.9669415950775146
      ],
      [
        1.199051856994629,
        1.2831618785858154
      ],
      [
        -0.7294472455978394,
        0.8021155595779419
      ],
      [
        -1.8575164079666138,
        0.615510880947113
      ],
      [
        1.2572972774505615,
        -1.1955351829528809
      ],
      [
        0.8431822061538696,
        0.9464893341064453
      ],
      [
        0.6719025373458862,
        -1.6929949522018433
      ],
      [
        1.0002080202102661,
        -0.07677439600229263
      ],
      [
        1.429251790046692,
        0.3525606095790863
      ],
      [
        -0.34927356243133545,
        -0.01492084376513958
      ],
      [
        0.1849461793899536,
        -0.7865856289863586
      ],
      [
        -0.4065440893173218,
        -1.588363528251648
      ],
      [
        0.5654629468917847,
        1.0210728645324707
      ]
    ],
    'clusters': [
      3,
      3,
      0,
      2,
      2,
      3,
      1,
      3,
      3,
      2,
      3,
      2,
      3,
      3,
      3,
      3,
      3,
      1,
      3,
      3,
      3,
      0,
      3,
      1,
      3,
      2,
      2,
      3,
      2,
      1,
      3,
      2,
      1,
      1,
      1,
      3,
      2,
      3,
      3,
      3,
      3,
      3,
      3,
      3,
      1,
      3,
      2,
      3,
      3,
      1,
      3,
      2,
      3,
      3,
      2,
      3,
      3,
      3,
      2,
      3,
      3,
      1,
      3,
      3,
      2,
      1,
      2,
      3,
      3,
      3,
      3,
      2,
      3,
      3,
      3,
      3,
      1,
      1,
      3,
      1,
      3,
      1,
      1,
      3,
      3,
      2,
      3,
      3,
      2,
      1,
      2,
      1,
      3,
      3,
      2,
      3,
      3,
      3,
      2,
      3,
      3,
      2,
      2,
      2,
      1,
      1,
      1,
      1,
      1,
      1,
      3,
      3,
      3,
      3,
      3,
      1,
      3,
      1
    ]
  }
}

export default PetriDish