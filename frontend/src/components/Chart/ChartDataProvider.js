import React, { Component } from 'react';
import Aux from '../../hoc/Aux/Aux';
import Spinner from '../Spinner/Spinner';
import Chart from './Chart';
import './Chart.css';
import Select from 'react-select';
import DatePicker from "react-datepicker";
import "./Chart.css";
import "react-datepicker/dist/react-datepicker.css";
import moment from 'moment';
import axios from 'axios';

function validate(device_uuid){
    return{
        device_uuid: device_uuid.length === 0
    };
}
class ChartDataProvider extends Component {
    state = {
        data: [],
        filteredData: [],
        loaded: false,
        selectedOption: null,
        device_uuid: '',
        end_time: moment().format('LLL'),
        window_time: 60,
        num_windows: 10,   
    }    
    
    componentDidMount(){
        axios.get('http://127.0.0.1:8000/api/bandwidth')
        .then(response => {
            this.setState({
                data: response.data,
                loaded: true
            })
        })
    }

    handleDevice_uuidChange = device_uuid => {
        this.setState({device_uuid})
    }
    // check if length of debvice_uuid input is not 0
    canBeSubmitted(){
        const errors = validate(this.state.device_uuid);
        const isDisabled = Object.keys(errors).some(x => errors[x])
        return !isDisabled;
    }
    
    handleDateChange = (date) => {
        this.setState({
            endDate: date
        })
    }    


    // form submit event
    handleSubmit = (event) => {
        
        // device_uuid is required; otherwise cannot submit
        if(!this.canBeSubmitted()){
            event.preventDefault();
            return;
        }

        const data = new FormData(event.target);
        // get the value of inputs
        const [device_uuid, end_time, window_time, num_windows] = [data.get('device_uuid'), data.get('end_time'), data.get('window_time'), data.get('num_windows')]
        
        // PRINT
        // console.log(device_uuid, end_time, window_time, num_windows);

        // update end_time with input if end_time is given
        if(end_time !== ''){
            this.setState({
                end_time: end_time
            })
        }
        // update window_time with input if window_time is given
        if(window_time !== ''){
            this.setState({
                window_time: window_time
            })
        } 
        // update num_windows with input if num_windows is given
        if(num_windows !== ''){
            this.setState({
                num_windows: num_windows
            })
        }                

        // TODO: timeout??
        // axios.get('http://127.0.0.1:8000/api/bandwidth', {'timeout': 1000 * window_time})

        // axios.get('http://127.0.0.1:8000/api/bandwidth')


        // return the filtered array
        const newElement = new Array(this.state.data.filter(datum => {
            return (datum.device_id === device_uuid && Math.floor(new Date(datum.timestamp).getTime()/1000) < moment(this.state.end_time).format('X'))
        }))
            const truncElement = new Array(newElement[0].slice(0, this.state.num_windows))
            
            // set updated array as filteredData (it will be used in chart.js)
            this.setState({
                filteredData : truncElement,
            })
    }

    render(){
        const { data, loaded, filteredData, device_uuid} = this.state;

        // error validation for required device_uuid field
        const errors = validate(device_uuid);
        const isDisabled = Object.keys(errors).some(x => errors[x]);

        // populate device_uuid otions
        const distict_data = Array.from(new Set(data.map(datum => datum.device_id)))
        const options = distict_data.map(datum => {
            return {'label': datum, 'value': datum}
        })
        
        
        return(
            <Aux>
            <div className="container">
            <form onSubmit={this.handleSubmit}>
                <div className="form-group row mt-3">
                    <label className="col-2 col-form-label">device_uuid</label>
                    <div className="col-10 ">
                    {/* required */}
                    <Select
                        className = {errors.device_uuid ? "error" : ""}
                        options = {options}
                        name="device_uuid"
                        value = {device_uuid}
                        onChange = {this.handleDevice_uuidChange}
                    />
                    </div>
                </div> 
                <div className="form-group row">
                    <label className="col-2 col-form-label">end time</label>
                    <div class="col-10">
                    <DatePicker
                        className="form-control"
                        selected={this.state.endDate}
                        timeFormat="HH:mm"
                        showTimeSelect
                        timeIntervals={15}
                        dateFormat="MMMM d, yyyy h:mm aa"
                        timeCaption="time"
                        onChange={this.handleDateChange}
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
                <button disabled={isDisabled} className="btn btn-outline-primary">Submit</button>
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