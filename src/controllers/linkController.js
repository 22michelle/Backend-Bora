import { response } from "../helpers/Response.js";
import { LinkModel } from "../models/linkModel.js";
import { UserModel } from "../models/userModel.js";

const linkCtrl = {};

linkCtrl.updateLink = async (data) => {
  try {
    const { senderId, receiverId, feeRate, amount, senderName, receiverName } = data;
    const adminId = "66e23b0b9d29581c2c6028dd";

    let link = await LinkModel.findOne({ senderId, receiverId });
    let oppositeLink = await LinkModel.findOne({ senderId: receiverId, receiverId: senderId });

    // Case 1: Create link if none exists in both directions
    if (!link && !oppositeLink) {
      link = new LinkModel({
        senderId,
        receiverId,
        amount,
        feeRate,
        senderName,
        receiverName,
      });
      await link.save();

      // Increment trigger if receiver is not admin
      if (receiverId.toString() !== adminId) {
        const receiver = await UserModel.findById(receiverId);
        if (receiver) {
          receiver.trigger += 1;
          await receiver.save();
        }
      }
      return { success: true, message: "Link created between sender and receiver" };
    }

    // Case 2: Strengthen link if it exists in sender -> receiver direction
    if (link) {
      let newRate = link.feeRate;
      if (feeRate !== 0) {
        newRate = (link.feeRate * link.amount + amount * feeRate) / (link.amount + amount);
      }
      link.amount += amount;
      link.feeRate = newRate;
      link.senderName = senderName;
      link.receiverName = receiverName;
      await link.save();
      return { success: true, message: "Strengthened link between sender and receiver" };
    }

    // If there is a link in the opposite direction (receiver -> sender)
    if (oppositeLink) {
      // Case 3: Weaken link if link value is greater than amount
      if (oppositeLink.amount > amount) {
        oppositeLink.amount -= amount;
        await oppositeLink.save();
        return { success: true, message: "Weakened link between receiver and sender" };
      }

      // Case 4: Delete the link if the value is equal to the amount
      if (oppositeLink.amount === amount) {
        await LinkModel.deleteOne({ _id: oppositeLink._id }); // Use deleteOne instead of remove
        return { success: true, message: "Link removed between receiver and sender" };
      }

     // Case 5: Delete the link if the value is less than the amount, and create a link in the opposite direction
      if (oppositeLink.amount < amount) {
        const remainingAmount = amount - oppositeLink.amount;
        await LinkModel.deleteOne({ _id: oppositeLink._id });

       // Create new sender -> receiver link with the remaining value
        link = new LinkModel({
          senderId,
          receiverId,
          amount: remainingAmount,
          feeRate,
          senderName,
          receiverName,
        });
        await link.save();
        return { success: true, message: "New link created with remaining value" };
      }
    }
  } catch (error) {
    console.error(`Error creating or updating link: ${error.message}`);
    return { success: false, message: error.message };
  }
};

// Get All Links
linkCtrl.getAllLinks = async (req, res) => {
  try {
    const links = await LinkModel.find()
      .populate('senderId', 'name')
      .populate('receiverId', 'name');

    return response(res, 200, true, links, "Links obtained successfully");
  } catch (error) {
    response(res, 500, false, null, error.message);
  }
};

// Get Link by ID
linkCtrl.getLinkById = async (req, res) => {
  try {
    const linkId = req.params.linkId;
    const link = await LinkModel.findById(linkId)
      .populate('senderId', 'name')
      .populate('receiverId', 'name');

    if (!link) {
      return response(res, 404, false, null, "Link not found");
    } else {
      return response(res, 200, true, link, "Link found successfully");
    }
  } catch (error) {
    response(res, 500, false, null, error.message);
  }
};

export default linkCtrl;