import React, { memo } from 'react';
import _ from 'lodash';
import { Container, Button, Table } from 'rendition';
import { withTheme } from 'styled-components';

const columns = [
  { label: 'Name', field: 'name' },
  {
    label: 'Link',
    field: 'downloadUrl',
    render: value => (
      <Button href={value} secondary icon={<i className="fas fa-download" />}>
        Download
      </Button>
    ),
  },
];

const Releases = memo(({ assets, ...rest }) => {
  if (_.isEmpty(assets)) {
    return null;
  }

  return (
    <Container {...rest}>
      <Table columns={columns} data={assets} rowKey="name" />
    </Container>
  );
});

export default withTheme(Releases);
