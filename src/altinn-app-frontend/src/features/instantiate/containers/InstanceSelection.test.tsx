import React from 'react';

import { getInitialStateMock } from '__mocks__/initialStateMock';
import configureStore from 'redux-mock-store';
import { mockMediaQuery, renderWithProviders } from 'testUtils';
import type { Store } from 'redux';

import InstanceSelection from 'src/features/instantiate/containers/InstanceSelection';
import type { IInstanceSelectionProps } from 'src/features/instantiate/containers/InstanceSelection';
import type { IRuntimeState, ISimpleInstance } from 'src/types';

const renderInstanceSelection = (
  store: Store,
  props: IInstanceSelectionProps,
) => {
  return renderWithProviders(<InstanceSelection {...props} />, { store });
};

const { setScreenWidth } = mockMediaQuery(992);

describe('InstanceSelection', () => {
  let mockInitialState: IRuntimeState;
  let mockStore: any;
  let mockStartNewInstance: () => void;
  let mockActiveInstances: ISimpleInstance[];

  beforeEach(() => {
    // Set screen size to desktop
    setScreenWidth(1200);
    const createStore = configureStore();
    mockInitialState = getInitialStateMock({});
    mockStore = createStore(mockInitialState);
    mockStartNewInstance = jest.fn();
    mockActiveInstances = [
      {
        id: 'some-id',
        lastChanged: '2021-10-05T07:51:57.8795258Z',
        lastChangedBy: 'Navn Navnesen',
      },
      {
        id: 'some-other-id',
        lastChanged: '2021-05-13T07:51:57.8795258Z',
        lastChangedBy: 'Kåre Nordmannsen',
      },
    ];
  });

  it('should show full size table for larger devices', () => {
    const rendered = renderInstanceSelection(mockStore, {
      instances: mockActiveInstances,
      onNewInstance: mockStartNewInstance,
    });
    const altinnTable = rendered.container.querySelector(
      '#instance-selection-table',
    );
    expect(altinnTable).not.toBeNull();
  });

  it('should display mobile table for smaller devices', () => {
    // Set screen size to mobile
    setScreenWidth(600);
    const rendered = renderInstanceSelection(mockStore, {
      instances: mockActiveInstances,
      onNewInstance: mockStartNewInstance,
    });
    const altinnMobileTable = rendered.container.querySelector(
      '#instance-selection-mobile-table',
    );
    expect(altinnMobileTable).not.toBeNull();
  });

  it('should display active instances', async () => {
    const rendered = renderInstanceSelection(mockStore, {
      instances: mockActiveInstances,
      onNewInstance: mockStartNewInstance,
    });

    const firstInstanceChangedBy = await rendered.findByText(
      mockActiveInstances[0].lastChangedBy,
    );
    const secondInstanceChangedBy = await rendered.findByText(
      mockActiveInstances[1].lastChangedBy,
    );

    const firstInstanceLastChanged = await rendered.findByText('10/05/2021');
    const secondInstanceLastChanged = await rendered.findByText('05/13/2021');

    expect(firstInstanceChangedBy).not.toBeNull();
    expect(secondInstanceChangedBy).not.toBeNull();

    expect(firstInstanceLastChanged).not.toBeNull();
    expect(secondInstanceLastChanged).not.toBeNull();
  });

  it('pressing "Start på nytt" should trigger callback', () => {
    const rendered = renderInstanceSelection(mockStore, {
      instances: mockActiveInstances,
      onNewInstance: mockStartNewInstance,
    });

    rendered.getByText('Start på nytt').click();
    expect(mockStartNewInstance).toBeCalledTimes(1);
  });
});
