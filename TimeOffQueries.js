import { gql } from 'react-apollo';

const corporationTimeOffRequestQuery = gql`
  query ($corporationId: Uuid!, $cursor: Cursor){
    allTimeOffRequests(
        first: 25,
        after: $cursor,
        condition: {corporationId: $corporationId},
        orderBy: START_DATE_DESC){
      edges {
        node {
          userByRequestorId {
            firstName
            lastName
          }
          id
          startDate
          endDate
          submissionDate
          requestType
          minutesPaid
          payDate
          notes
          decisionStatus
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`

const approveTimeOffRequestMutation = gql`
  mutation ($clientMutationId: String!, $id: Uuid!, $decision: TimeOffDecisionStatus!, $approverId: Uuid){
    updateTimeOffRequestById(
      	input: {clientMutationId: $clientMutationId,
    		id: $id,
    		timeOffRequestPatch: {decisionStatus: $decision, approverId: $approverId}}){
      timeOffRequest{
        id
        decisionStatus
      }
    }
  }
`

export { corporationTimeOffRequestQuery, approveTimeOffRequestMutation };
