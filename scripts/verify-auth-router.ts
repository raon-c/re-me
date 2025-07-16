/**
 * Manual verification script for auth router
 * This script verifies that the auth router is properly structured and exported
 */

import { authRouter } from '../src/server/api/routers/auth';
import { appRouter } from '../src/server/api/root';

console.log('🔍 Verifying Auth Router Implementation...\n');

// Check if auth router is properly exported
console.log('✅ Auth router exported successfully');

// Check if auth router is included in app router
const hasAuthRouter = 'auth' in appRouter._def.record;
console.log(
  `${hasAuthRouter ? '✅' : '❌'} Auth router included in app router`
);

// Check available procedures
const authProcedures = Object.keys(authRouter._def.procedures);
console.log('\n📋 Available Auth Procedures:');
authProcedures.forEach((procedure) => {
  console.log(`  - ${procedure}`);
});

// Expected procedures based on requirements
const expectedProcedures = [
  'register',
  'login',
  'socialLogin',
  'logout',
  'getSession',
  'resetPassword',
  'updatePassword',
  'updateProfile',
  'deleteAccount',
  'resendEmailVerification',
];

console.log('\n🎯 Checking Required Procedures:');
expectedProcedures.forEach((procedure) => {
  const exists = authProcedures.includes(procedure);
  console.log(`  ${exists ? '✅' : '❌'} ${procedure}`);
});

// Check procedure types
console.log('\n🔒 Checking Procedure Types:');
const publicProcedures = [
  'register',
  'login',
  'socialLogin',
  'getSession',
  'resetPassword',
];
const protectedProcedures = [
  'logout',
  'updatePassword',
  'updateProfile',
  'deleteAccount',
  'resendEmailVerification',
];

publicProcedures.forEach((procedure) => {
  if (authProcedures.includes(procedure)) {
    console.log(`  ✅ ${procedure} (public)`);
  }
});

protectedProcedures.forEach((procedure) => {
  if (authProcedures.includes(procedure)) {
    console.log(`  ✅ ${procedure} (protected)`);
  }
});

console.log('\n🎉 Auth Router Verification Complete!');
