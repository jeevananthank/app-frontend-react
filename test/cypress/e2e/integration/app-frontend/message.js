/// <reference types='cypress' />
/// <reference types="../../support" />

import AppFrontend from '../../pageobjects/app-frontend';
import * as texts from '../../fixtures/texts.json';
import { instanceIdExp } from '../../support/util';

const appFrontend = new AppFrontend();

describe('Message', () => {
  let instanceMetadata, instanceId;
  const instanceIdExpr = instanceIdExp();

  before(() => {
    cy.intercept('POST', `**/instances?instanceOwnerPartyId*`).as('createdInstance');
    cy.intercept('**/active', []).as('noActiveInstances');
    cy.startAppInstance(Cypress.env('multiData2Stage'));
    cy.get(appFrontend.closeButton).should('be.visible');
  });

  it('Attachments List displays correct number of attachments', () => {
    cy.get(appFrontend.message['header']).should('exist');
    cy.wait('@createdInstance').then((xhr) => {
      instanceMetadata = xhr.response.body;
      instanceId = instanceMetadata.id;
      const instanceGuid = instanceId.split('/')[1];
      cy.fixture('attachment.json').then((data) => {
        data.instanceGuid = instanceGuid;
        instanceMetadata.data.push(data);
      });
      const interceptExpression = instanceIdExp({ postfix: '$' });
      cy.intercept('GET', interceptExpression, instanceMetadata);
    });
    cy.reload();
    cy.get(appFrontend.message['attachmentList'])
      .siblings('ul')
      .children('a')
      .then((attachments) => {
        cy.get(attachments).should('have.length', 1);
        cy.get(attachments).first().should('contain.text', texts.downloadAttachment);
        cy.get(appFrontend.attachmentIcon).should('be.visible');
      });
    cy.url().then((url) => {
      const instantiateUrl =
        Cypress.env('environment') === 'local'
          ? 'http://altinn3local.no/ttd/frontend-test'
          : 'https://ttd.apps.tt02.altinn.no/ttd/frontend-test/';
      const instanceId = instanceIdExpr.exec(url)[1];
      cy.get(appFrontend.startAgain).contains(instanceId).and('contain.text', Cypress.env('multiData2Stage'));
      cy.get(appFrontend.startAgain).find('a').should('have.attr', 'href', instantiateUrl);
    });
    cy.get(appFrontend.sendinButton)
      .should('be.visible')
      .invoke('outerWidth')
      .then((width) => {
        width = Math.round(width);
        expect(width).to.equal(112);
      });
  });
});
