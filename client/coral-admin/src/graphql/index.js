import {add} from 'coral-framework/services/graphqlRegistry';
const queues = ['all', 'premod', 'flagged', 'accepted', 'rejected'];

const extension = {
  mutations: {
    SetUserStatus: () => ({
      refetchQueries: ['CoralAdmin_Community'],
    }),
    RejectUsername: () => ({
      refetchQueries: ['CoralAdmin_Community'],
    }),
    SetCommentStatus: ({variables: {commentId, status}}) => ({
      updateQueries: {
        CoralAdmin_Moderation: (oldData) => {
          const comment = queues.reduce((comment, queue) => {
            return comment ? comment : oldData[queue].find((c) => c.id === commentId);
          }, null);

          let accepted = oldData.accepted;
          let acceptedCount = oldData.acceptedCount;
          let rejected = oldData.rejected;
          let rejectedCount = oldData.rejectedCount;

          if (status !== comment.status) {
            if (status === 'ACCEPTED') {
              comment.status = 'ACCEPTED';
              acceptedCount++;
              accepted = [comment, ...accepted];
            }
            else if (status === 'REJECTED') {
              comment.status = 'REJECTED';
              rejectedCount++;
              rejected = [comment, ...rejected];
            }
          }

          const premod = oldData.premod.filter((c) => c.id !== commentId);
          const flagged = oldData.flagged.filter((c) => c.id !== commentId);
          const premodCount = premod.length < oldData.premod.length ? oldData.premodCount - 1 : oldData.premodCount;
          const flaggedCount = flagged.length < oldData.flagged.length ? oldData.flaggedCount - 1 : oldData.flaggedCount;

          if (status === 'REJECTED') {
            accepted = oldData.accepted.filter((c) => c.id !== commentId);
            acceptedCount = accepted.length < oldData.accepted.length ? oldData.acceptedCount - 1 : oldData.acceptedCount;
          }
          else if (status === 'ACCEPTED') {
            rejected = oldData.rejected.filter((c) => c.id !== commentId);
            rejectedCount = rejected.length < oldData.rejected.length ? oldData.rejectedCount - 1 : oldData.rejectedCount;
          }

          return {
            ...oldData,
            premodCount: Math.max(0, premodCount),
            flaggedCount: Math.max(0, flaggedCount),
            acceptedCount: Math.max(0, acceptedCount),
            rejectedCount: Math.max(0, rejectedCount),
            premod,
            flagged,
            accepted,
            rejected,
          };
        }
      }
    }),
  },
};

add(extension);