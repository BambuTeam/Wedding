'use client';

import React from 'react';
import { CreateClientWizardDrawer, CreateClientWizardProps } from './CreateClientWizardDrawer';

export function CreateClientModal(props: CreateClientWizardProps) {
  return <CreateClientWizardDrawer {...props} />;
}
