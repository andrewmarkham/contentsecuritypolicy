import React from 'react';

import { Button, Col, DatePicker, Form, Input, Row, Select } from 'antd';

import { SearchParams, SelectValue } from '../Types/types';
import './IssueSearchForm.css';


export function IssueSearchForm(props: {
    loading: boolean,
    directives: Array<SelectValue>,
    initialDirective?: string | null,
    browsers: Array<SelectValue>,
    types: Array<SelectValue>,
    initialBrowser?: string | null,
    initialQuery?: string | null,
    onSearch: (searchParams: SearchParams) => void
  }) {
  
    const { Search } = Input;
  
    const [form] = Form.useForm();
  
    const onFinish = (values: any) => {

      var searchParams: SearchParams = {
        dateFrom: values.dateFrom,
        browser: values.browser,
        directive: values.directive,
        type: values.type,
        query: values.query
      };
  
      console.log(searchParams);
      props.onSearch(searchParams);
    };
  
    return (
      <Form
        className="issue-search-form"
        disabled={props.loading}
        form={form}
        initialValues={{
            directive: props.initialDirective,
            browser: props.initialBrowser,
            query: props.initialQuery
        }}
        onFinish={onFinish}
      >
        <Row gutter={[8,2]} justify='end'>
          <Col span={8}>
            <Form.Item name="dateFrom" label="Date From">
              <DatePicker
                className="issue-search-form__control"
                showTime
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="query">
              <Search placeholder="input search text" allowClear
                className="issue-search-form__control" />
            </Form.Item>
          </Col>
          <Col span={2}>
          </Col>
        <Col span={8}>
          <Form.Item name="type" label="Types">
            <Select
              mode="multiple"
              className="issue-search-form__control"
              placeholder="Please select"
              options={props.types}
            />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item name="browser" label="Browser">
            <Select
              mode="multiple"
              className="issue-search-form__control"
              placeholder="Please select"
              options={props.browsers}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="directive" label="Directive">
            <Select
              mode="multiple"
              className="issue-search-form__control"
              placeholder="Please select"
              options={props.directives}
            />
          </Form.Item>
          </Col>
          <Col span={2}>
            <Form.Item >
              <Button type="primary" htmlType="submit" disabled={props.loading}>Search</Button>
            </Form.Item>
          </Col>
        </Row>

      </Form>
    );
  }
