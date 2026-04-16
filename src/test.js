import {
  createEmptyRegistry,
  registerPlayer,
  getAdminPlayerView,
  getPrivatePlayerView,
  getPublicPlayerView,
  submitPlayerEditRequest,
  approvePlayerEditRequest,
  rejectPlayerEditRequest,
  printRegistryState
} from './playerRegistry.js';

// --------------------------------------------
// Create registry
// --------------------------------------------
const registry = createEmptyRegistry();

// --------------------------------------------
// Register player
// --------------------------------------------
const registerResult = registerPlayer(registry, {
  fullName: 'Jason Isaacs',
  dsaNumber: 'DSA12345',
  idNumber: '9001015009087',
  dateOfBirth: '1990-01-01',
  race: 'ExampleRace',
  gender: 'Male',
  registrationStatus: 'active',
  associationName: 'Observatory Darts Association',
  provinceName: 'Western Cape',
  phone: '0820000000',
  email: 'jason@example.com',
  addressLine1: '1 Main Road',
  addressLine2: 'Observatory',
  city: 'Cape Town',
  postalCode: '7925'
});

const playerId = registerResult.player.playerId;

printRegistryState('REGISTERED PLAYER', registerResult.player);

// --------------------------------------------
// View layers
// --------------------------------------------
const adminView = getAdminPlayerView(registry, playerId);
const privateView = getPrivatePlayerView(registry, playerId);
const publicView = getPublicPlayerView(registry, playerId, {
  displayName: 'Jason Isaacs'
});

printRegistryState('ADMIN VIEW', adminView.player);
printRegistryState('PRIVATE VIEW', privateView.player);
printRegistryState('PUBLIC VIEW', publicView.player);

// --------------------------------------------
// Submit edit request
// --------------------------------------------
const editRequestResult = submitPlayerEditRequest(registry, playerId, {
  contact: {
    phone: '0831111111',
    email: 'newjason@example.com',
    addressLine1: '99 Updated Road'
  }
});

const requestId = editRequestResult.request.requestId;

printRegistryState('SUBMITTED EDIT REQUEST', editRequestResult.request);

// --------------------------------------------
// Approve edit request
// --------------------------------------------
const approveResult = approvePlayerEditRequest(registry, requestId, 'admin_jake');

printRegistryState('APPROVED EDIT REQUEST', approveResult.request);
printRegistryState('PLAYER AFTER APPROVAL', approveResult.player);

// --------------------------------------------
// Submit second request and reject it
// --------------------------------------------
const secondEditRequest = submitPlayerEditRequest(registry, playerId, {
  contact: {
    phone: '0849999999'
  }
});

const secondRequestId = secondEditRequest.request.requestId;

printRegistryState('SECOND SUBMITTED EDIT REQUEST', secondEditRequest.request);

const rejectResult = rejectPlayerEditRequest(registry, secondRequestId, 'admin_jake');

printRegistryState('REJECTED EDIT REQUEST', rejectResult.request);

// --------------------------------------------
// Final registry state
// --------------------------------------------
printRegistryState('FINAL REGISTRY STATE', registry);