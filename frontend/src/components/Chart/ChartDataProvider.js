import React, { Component } from 'react';
import Aux from '../../hoc/Aux/Aux';
import Spinner from '../Spinner/Spinner';
import Chart from './Chart';
import Select from 'react-select';
// import TimePicker from 'rc-time-picker';
// import 'rc-time-picker/assets/index.css';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from 'moment';
import axios from 'axios';
// import styles from './Chart.css';

// import {Container, Row, Col} from 'react-bootstrap';

class ChartDataProvider extends Component {
    state = {
        data: [],
        filteredData: [],
        loaded: false,
        selectedOption: null,
        // default value
        device_uuid: 'cf4844bc-a107-4e0a-84e1-fa04d76d388c',
        end_time: moment(),
        // moment()
        window_time: 60,
        num_windows: 10,
        isRequired: ''        
    }    
    
    // this.setState({
    //     end_time: moment(date).format('DD-MM-YYYY'); 
    // })

    // this.setState({
    //     endtime: todayDate
    // })

    // componentDidMount() {
    //     try {
    //       const res = await ("http://127.0.0.1:8000/api/bandwidth");
    //       const data = await res.json();

        
    //       this.setState({
    //         data : data,
    //         filteredData: data.filter(datum => {
    //             return datum.device_id == 'cf4844bc-a107-4e0a-84e1-fa04d76d388c'
    //         }),
    //         loaded: true
    //       });
    //     } catch (e) {
    //         console.log(e);
    //     }
    //   }
    componentDidMount(){
        axios.get('http://127.0.0.1:8000/api/bandwidth')
        .then(response => {
            // console.log(response.data);
            this.setState({
                data: response.data,
                loaded: true

            })
        })
    }

      handleSubmit = (event) => {
        event.preventDefault();
        const data = new FormData(event.target);
        const [device_uuid, end_time, window_time, num_windows] = [data.get('device_uuid'), data.get('end_time'), data.get('window_time'), data.get('num_windows')]
        
        // console.log(end_time , )
        // TODO: end time
        console.log(window_time == undefined);
        console.log(device_uuid, end_time, window_time, num_windows);
        
        // data.set('device_uuid', device_uuid);

        axios.get('http://127.0.0.1:8000/api/bandwidth', {'timeout': 1000 * window_time})


        // axios.get('http://127.0.0.1:8000/api/bandwidth', {'timeout': 10000})
        // axios({
        //     timeout: 1000 * 1,
        //     url: 'http://127.0.0.1:8000/api/bandwidth'
        // })
        .then(response => {
            
            const newElement = new Array(response.data.filter(datum => {
                return (datum.device_id === device_uuid && Math.floor(new Date(datum.timestamp).getTime()/1000) < moment(end_time).format('X'))
            }))
            
            // console.log(newElement);
            
            // 2018-04-27T13:33:03Z
            // console.log('end_time',end_time)
            // console.log('time comparison', '2018-04-27T13:33:03Z').valueOf, new Date(moment(end_time).format('X')).valueOf, new Date('2018-04-27T13:33:03Z').valueOf < moment(end_time).format('X'))

            

            // const xx = new Date('2018-04-27T13:33:03Z')
            // console.log('formtted1', Math.floor(xx.getTime()/1000))
            // console.log('comparing', Math.floor(xx.getTime()/1000) < moment(end_time).format('X'))
            // console.log('formatted', moment(end_time).format('x'))
            


            const truncElement = new Array(newElement[0].slice(0, num_windows))

            console.log('truncElement', truncElement)
            this.setState({
                filteredData : truncElement,
                end_time : end_time,
                window_time : window_time,
                num_windows : num_windows,


                // num_windows : num_windows
            })
        })

        // try{
        //     const res = fetch("http://127.0.0.1:8000/api/bandwidth", {
        //         // body: data,
        //     });
        //     const data_fetch = res.json();
            
            // console.log(data_fetch)
            
            // console.log(typeof(device_uuid))
            // data_fetch.map(datum => {
            //     console.log(datum.device_id === device_uuid )
            // })
            // [...this.state.arrayvar, newelement]


        //     const newElement = new Array(data_fetch.filter(datum => {
        //         return (datum.device_id === device_uuid)}))
            
        //     console.log(newElement);
        //     this.setState({
        //         filteredData : [... this.state.filteredData, newElement]
        // })

        // }catch(e){
        //     console.log(e);
        // }

    }
    // console.log(this.state.filteredData)
    handleChange(date){
        this.setState({
            endDate: date
        })
    }

    render(){
        const { data, loaded, filteredData} = this.state;

        // console.log('filteredData',filteredData);

        const distict_data = Array.from(new Set(data.map(datum => datum.device_id)))

        const options = distict_data.map(datum => {
            return {'label': datum, 'value': datum}
        })

        const {isValid} = this.props;

        const customStyles = {
            control: (base, state) => ({
              ...base,
              // state.isFocused can display different borderColor if you need it
              borderColor: state.isFocused ?
                '#ddd' : isValid ?
                '#ddd' : 'red',
              // overwrittes hover style
              '&:hover': {
                borderColor: state.isFocused ?
                  '#ddd' : isValid ?
                  '#ddd' : 'red'
              }
            })
          }
        //   Required(){

        //   }
        
        return(
            <Aux>
            <div className="container">
            <form onSubmit={this.handleSubmit}>
                <div className="form-group row mt-3">
                    <label className="col-2 col-form-label">device_uuid</label>
                    <div className="col-10 ">
                    {/* required */}
                    <Select
                        options = {options}
                        name="device_uuid"
                    />
                    </div>
                </div> 
                <div className="form-group row">
                    <label className="col-2 col-form-label">end time</label>
                    <div class="col-10">
                    <DatePicker
                        className="form-control"
                        // selected={moment(new Date()).format('LLLL')}
                        // value={moment(new Date()).format('LLLL')}
                        selected={this.state.endDate}
                        timeFormat="HH:mm"
                        showTimeSelect
                        timeIntervals={15}
                        dateFormat="MMMM d, yyyy h:mm aa"
                        timeCaption="time"
                        onChange={this.handleChange.bind(this)}
                        // onChange={this.handleChange.bind(this)}
                        // value={this.state.end_time}
                        name="end_time"
                    />
                    </div>
                </div>
                <div className="form-group row">
                    <label className="col-2 col-form-label">window time</label>                    
                    <div className="col-10">
                    <input
                        className="form-control "
                        type="number"
                        name="window_time"
                        defaultValue={60}
                        placeholder="type end_time default (60)"                
                    />
                    </div>                
                </div>
                <div className="form-group row">
                    <label className="col-2 col-form-label">number of windows</label>                    
                    <div className="col-10">
                    <input
                        className="form-control"
                        type="number"
                        name="num_windows"
                        defaultValue={10}
                        placeholder="type number of window default (10)"                
                    />
                    </div>                
                </div>                              
                <button className="btn btn-outline-primary">Submit</button>
            </form>
            </div>
            

            {loaded ? 
                (<Chart data={filteredData} />)
            :
                (<Spinner/>)
            }
            </Aux>
        );        
    }
}

export default ChartDataProvider;