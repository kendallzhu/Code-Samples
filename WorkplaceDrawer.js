import React, { Component } from 'react'
import Drawer from 'material-ui/Drawer';
import IconButton from 'material-ui/IconButton';
import { Image, Dropdown } from 'semantic-ui-react';
import RaisedButton from 'material-ui/RaisedButton';
import { cloneDeep, map } from 'lodash';
import Dropzone from 'react-dropzone';

import { BASE_API } from '../../../constants';
import CircleButton from '../../../components/CircleButton';
import { stateOptions } from '../../../constants/states';
import { closeButton, colors } from '../../styles';
import SuperAgent from 'superagent';
import './workplace-drawer.css';

const initialState = {
  workplace: {
    id: '',
    workplaceName: '',
    brandId: '',
    workplaceImageUrl: '',
    address: '',
    address2: '',
    city: '',
    zip: ''
  },
  blob: null
};

const styles = {
  circleButton: {
    fontSize: 18,
    padding: '6px 5px',
    fontWeight: 'bold'
  },
  closeButton
};

class DrawerHelper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      workplace: cloneDeep(props.workplace || initialState.workplace)
    };
  }

  componentWillReceiveProps(nextProps) {
    const workplace = cloneDeep(nextProps.workplace || initialState.workplace);
    this.setState({ workplace });
  }

  closeDrawer = () => {
    this.setState({ ...initialState }, () => {
      this.props.closeDrawer();
    });
  };

  handleSubmitEvent = (event) => {
    // Resetting the field values.
    this.props.handleSubmit(this.state.workplace);
    this.setState({ ...initialState });
  };

  handleImageUpload = (files) => {
    console.log(files);
    SuperAgent.post(`${BASE_API}/api/uploadImage`)
    .field('keyword', 'workplace')
    .field('id', this.state.workplace.id)
    .attach("theseNamesMustMatch", files[0])
    .end((err, res) => {
      if (err) {
        console.log(err);
        alert('Error Uploading File');
      } else {
        const workplace = Object.assign(this.state.workplace, { workplaceImageUrl : res.text });
        this.setState({workplace: workplace});
        alert('File uploaded!');
        this.setState({ blob: files[0] });
      }
    })
  };

  handleNewImageUpload = (files) => {
    files[0].preview = window.URL.createObjectURL(files[0]);
    this.setState({ blob: files[0] });
    this.handleImageUpload(files);
  };

  handleChange = (event) => {
    const { name, value } = event.target;
    const workplace = Object.assign(this.state.workplace, { [name]: value });
    this.setState({ workplace });
  };

  render() {
    const {
      workplace = {},
      brands = [],
      width = 600,
      open = true,
      openSecondary = true,
      docked = false
    } = this.props;
    const workplaceId = workplace && workplace.id;
    const messages = {
      title: (workplaceId && 'Update Workplace') || 'Add Workplace',
      buttonText: (workplaceId && 'Update Workplace') || 'Add Workplace'
    };
    const brandOptions = map(brands, brand => ({ key: brand.id, value: brand.id, text: brand.brandName }));
    const DrawerWorkplace = this.state.workplace;
    return (
      <Drawer docked={docked} width={width} openSecondary={openSecondary} onRequestChange={this.closeDrawer}
              open={open}>
        <div className="drawer-section workplace-drawer-section">
          <div className="drawer-heading col-md-12">
            <IconButton style={styles.closeButton} onClick={this.closeDrawer}>
              <Image src='/images/Icons_Red_Cross.png' size="mini" />
            </IconButton>
            <h2 className="text-center text-uppercase">{messages.title}</h2>
          </div>
          {!DrawerWorkplace.workplaceImageUrl && !this.state.blob && this.state.workplace.id &&
          <div className="upload-wrapper col-sm-8 col-sm-offset-2 col-md-8 col-md-offset-2 text-center">
            <Dropzone
              multiple={false}
              accept="image/*"
              onDrop={this.handleImageUpload}
              style={{}}>
              <Image src='/images/cloudshare.png' size="small" className="upload-img" />
              <RaisedButton
                containerElement='label'
                className="upload-btn"
                label="Upload Workplace Image"
                backgroundColor="#0022A1"
                labelColor="#fff"
              />
              <p className="text-uppercase upload-desc">
                Or Drag and Drop File
              </p>
            </Dropzone>
          </div>}
          {DrawerWorkplace.workplaceImageUrl && !this.state.blob &&
          <Image className="uploaded-image" src={DrawerWorkplace.workplaceImageUrl + "?" + new Date().getTime()} alt={workplace.name}
           size="large" />
          }
          {this.state.blob &&
          <Image className="uploaded-image" src={this.state.blob.preview} size="large" />
          }
          {(DrawerWorkplace.workplaceImageUrl || this.state.blob) && <RaisedButton
            backgroundColor={colors.primaryBlue}
            labelColor="#fafafa"
            className='upload-btn'
            containerElement='label'
            label='Change image'>
            <input type='file' onChange={(e) => this.handleNewImageUpload(e.target.files)} />
          </RaisedButton>}
          <div className="col-md-12 form-div">
            <div className="form-group">
              <label className="text-uppercase">Workplace Name</label>
              <input name="workplaceName"
                     onChange={this.handleChange}
                     value={DrawerWorkplace.workplaceName}
                     id="workplace-name"
                     type="text"
                     className="form-control" />
            </div>
            <div className="form-group">
              <label className="text-uppercase">Brand</label>
              <Dropdown className="form-control semantic-drawer-drop-down"
                        placeholder="Brand"
                        name="brandId"
                        value={DrawerWorkplace.brandId}
                        search selection
                        onChange={(e, target) => this.handleChange({ ...e, target })}
                        options={brandOptions} />
            </div>
            <div className="form-group">
              <label className="text-uppercase">Address Line1</label>
              <input name="address"
                     onChange={this.handleChange}
                     value={DrawerWorkplace.address || ''}
                     id="address-line1"
                     type="text"
                     className="form-control" />
            </div>
            <div className="form-group">
              <label className="text-uppercase">Address Line2</label>
              <input name="address2"
                     onChange={this.handleChange}
                     value={DrawerWorkplace.address2 || ''}
                     id="address-line2"
                     type="text"
                     className="form-control" />
            </div>
            <div className="inline-form form-inline">
              <div className="form-group">
                <label htmlFor="city" className="text-uppercase">City</label>
                <input name="city"
                       onChange={this.handleChange}
                       value={DrawerWorkplace.city || ''}
                       type="text"
                       className="form-control"
                       id="city" />
              </div>
              <div className="form-group">
                <label className="text-uppercase">State</label>
                <Dropdown className="form-control semantic-drawer-drop-down"
                          placeholder="State"
                          name="state"
                          search selection
                          onChange={(e, target) => this.handleChange({ ...e, target })}
                          options={stateOptions} />
              </div>
              <div className="form-group">
                <label htmlFor="zip" className="text-uppercase">Zip Code:</label>
                <input name="zip"
                       onChange={this.handleChange}
                       value={DrawerWorkplace.zip || ''}
                       type="text"
                       className="form-control"
                       id="zip" />
              </div>
            </div>
          </div>
        </div>
        <div className="drawer-footer">
          <div className="buttons text-center">
            {workplaceId && <CircleButton style={styles.circleButton} handleClick={this.closeDrawer} type="white"
                                          title="Cancel" />}
            <CircleButton style={styles.circleButton} handleClick={this.handleSubmitEvent} type="blue"
                          title={messages.buttonText} />
          </div>
        </div>
      </Drawer>
    );
  };
}

export default DrawerHelper;
