/**
 * Configer Page Module
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import {
  Button,
  Table,
  Popconfirm,
  Badge,
  Tooltip,
  Modal,
  Select,
  Icon,
} from 'antd';
import semver from 'semver';

import ConfigImportor from './ConfigImportor';
import Page from '../../components/component.page/';
import Markdown from '../../components/component.markdown/';

import { actions } from './store';
const { Option } = Select;

import styles from './index.less';

class ConfigerModule extends Component {
  static propTypes = {
    pending: PropTypes.bool,
    remoteConfigs: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      version: PropTypes.string.isRequired,
    })),
    localConfigs: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      version: PropTypes.string.isRequired,
    })),
    getConfigs: PropTypes.func,
    getRemoteConfigs: PropTypes.func,
    addConfig: PropTypes.func,
    uploadConfig: PropTypes.func,
    upgradeConfig: PropTypes.func,
    removeConfig: PropTypes.func,
    getConfigerVersions: PropTypes.func,
  }
  state = {
    importVisible: false,
    markSource: '',
    markVisible: false,
    versionEditorStatus: {},
  }
  componentWillMount() {
    this.props.getConfigs();
    this.props.getRemoteConfigs();
  }
  handleDelete(name) {
    this.props.removeConfig(name);
  }
  handleAddConfig = values => {
    this.props.addConfig(values.configName);
    this.setState({
      importVisible: false,
    });
  }
  handleCloseImportor = () => {
    this.setState({
      importVisible: false,
    });
  }
  handleUpgrade = e => {
    const { name, version } = e.target.dataset;
    this.props.upgradeConfig(name, version);
  }
  showConfigImporter = () => {
    this.setState({
      importVisible: true,
    });
  }
  showReadme = e => {
    const { name } = e.target.dataset;
    const { localConfigs } = this.props;
    const currentConfiger = localConfigs.find(d => d.name === name);
    this.showMarkModal(currentConfiger.readme);
  }
  showHistory = e => {
    const { name } = e.target.dataset;
    const { localConfigs } = this.props;
    const currentConfiger = localConfigs.find(d => d.name === name);
    this.showMarkModal(currentConfiger.history);
  }
  showMarkModal(content) {
    this.setState({
      markVisible: true,
      markSource: content,
    });
  }
  closeMarkModal = () => {
    this.setState({
      markVisible: false,
    });
  }
  renderVersionGrid = (text, record) => {
    const { versionEditorStatus } = this.state;
    const ret = [];
    if (versionEditorStatus[record.name]) {
      ret.push(
        <Select
          key="select"
          value={versionEditorStatus[record.name]}
          onFocus={() => {
            this.props.getConfigerVersions(record.name);
          }}
          onChange={value => {
            this.setState({
              versionEditorStatus: {
                ...versionEditorStatus,
                [record.name]: value,
              },
            });
          }}
          optionLabelProp="value"
          size="small"
          className={styles['Configer__Selector--wrapper']}
        >
          {
            record.versions && record.versions.map(d =>
              <Option value={d.version} key={d.version}>
                <p className={styles['Configer__Selector--version']}>{d.version}</p>
                {d.tag ? <p className={styles['Configer__Selector--tag']}>{d.tag}</p> : ''}
              </Option>
            )
          }
        </Select>
      );
      ret.push(
        <Button.Group key="action" size="small">
          <Button
            onClick={() => {
              this.props.upgradeConfig(record.name, versionEditorStatus[record.name]);
              this.setState({
                versionEditorStatus: {
                  ...versionEditorStatus,
                  [record.name]: false,
                }
              });
            }}
          >
            <Icon type="check" />
          </Button>
          <Button
            onClick={() => {
              this.setState({
                versionEditorStatus: {
                  ...versionEditorStatus,
                  [record.name]: false,
                }
              });
            }}
          >
            <Icon type="close" />
          </Button>
        </Button.Group>
      );
    } else {
      if (record.upgradable) {
        ret.push(
          <Tooltip key="notify" title={record.latestVersion}>
            <Badge dot>
              {text}
            </Badge>
          </Tooltip>
        );
      } else {
        ret.push(<span key="version">{text}</span>);
      }
      ret.push(
        <Icon
          type="edit"
          key="edit"
          onClick={() => {
            this.setState({
              versionEditorStatus: {
                ...versionEditorStatus,
                [record.name]: record.version,
              }
            });
          }}
        />
      );
    }
    return ret;
  }
  renderConfigList() {
    const { pending, localConfigs } = this.props;
    const props = {
      loading: pending,
      pagination: false,
      columns: [
        {
          title: '引擎',
          dataIndex: 'name',
          render: (text, record) => {
            return [
              <h5
                key="name"
                className={styles['Configer__Item--name']}
              >
                {text}
              </h5>,
              <p
                key="description"
                className={styles['Configer__Item--desc']}
              >
                {record.description}
              </p>,
            ];
          }
        },
        {
          title: '版本',
          dataIndex: 'version',
          render: this.renderVersionGrid,
        },
        {
          title: '操作',
          key: 'action',
          render: (data, record) => {
            const btns = [
              <button
                className={styles['Configer__Item--action']}
                key="readme"
                data-name={record.name}
                onClick={this.showReadme}
              >查看说明</button>,
              <button
                className={styles['Configer__Item--action']}
                data-name={record.name}
                onClick={this.showHistory}
                key="history"
              >版本历史</button>,
            ];
            if (record.upgradable) {
              btns.push(
                <button
                  className={styles['Configer__Item--action']}
                  key="upgrade"
                  data-version={record.latestVersion}
                  data-name={record.name}
                  onClick={this.handleUpgrade}
                >升级</button>
              );
            }
            return (
              <div className={styles.Configer__ItemAction}>
                {btns}
                <Popconfirm
                  placement="topRight"
                  title="删除当前引擎，会导致使用该引擎的项目无法运行，确定要删除吗？"
                  onConfirm={this.handleDelete.bind(this, record.name)}
                >
                  <button
                    className={classnames(
                      styles['Configer__Item--action'],
                      styles['Configer__Item--delete'],
                    )}
                  >删除</button>
                </Popconfirm>
              </div>
            );
          }
        },
      ],
      dataSource: localConfigs.map(d => Object.assign(d, {
        key: d.name,
      })),
      locale: {
        emptyText: '当前没有可用的项目引擎',
      }
    };
    return <Table {...props} />;
  }
  render() {
    const { markSource, markVisible } = this.state;
    return (
      <Page>
        <div className={styles.Configer__ActionBar}>
          <Button type="primary" onClick={this.showConfigImporter}>添加引擎</Button>
        </div>
        { this.renderConfigList() }
        <ConfigImportor
          visible={this.state.importVisible}
          onCancel={this.handleCloseImportor}
          onConfirm={this.handleAddConfig}
        />
        <Modal
          width={'80vw'}
          visible={markVisible}
          onCancel={this.closeMarkModal}
          footer={null}
        >
          <Markdown source={markSource} />
        </Modal>
      </Page>
    );
  }
}

const pageSelector = state => state['page.configer'];
const selectRemoteConfigs = createSelector(pageSelector, state => Object.values(state.remote.configMap));
const selectLocalConfigs = createSelector(pageSelector, state => {
  const localConfigs = Object.values(state.local.configMap);
  const remoteConfigMap = state.remote.configMap;
  localConfigs.forEach(d => {
    const remoteConfig = remoteConfigMap[d.name];
    if (remoteConfig && semver.gt(remoteConfig.version, d.version)) {
      Object.assign(d, {
        upgradable: true,
        latestVersion: remoteConfig.version,
      });
    }
  });
  return localConfigs;
});

const mapStateToProps = state => ({
  remoteConfigs: selectRemoteConfigs(state),
  localConfigs: selectLocalConfigs(state),
  pending: createSelector(
    pageSelector,
    s => s.progress.pending,
  )(state),
});
const mapDispatchToProps = dispatch => ({
  getConfigs: () => dispatch(actions.getConfigs()),
  getRemoteConfigs: () => dispatch(actions.getRemoteConfigs()),
  addConfig: configName => dispatch(actions.add(configName, dispatch)),
  uploadConfig: () => dispatch(actions.upload()),
  removeConfig: name => dispatch(actions.remove(name, dispatch)),
  upgradeConfig: (name, version) => dispatch(actions.upgrade(name, version, dispatch)),
  getConfigerVersions: name => dispatch(actions.getPkgVersions(name)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ConfigerModule);
