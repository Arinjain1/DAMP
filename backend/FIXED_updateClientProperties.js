// FIXED VERSION - Replace the updateClientProperties function in clientController.js with this

export const updateClientProperties = async (req, res, next) => {
  const brokerId = req.user.id;
  const clientId = req.params.id;
  const { selected_properties, interested_properties, hold_properties } = req.body;

  try {
    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    if (selected_properties !== undefined) {
      updateFields.push('selected_properties = $' + paramIndex);
      values.push(selected_properties);
      paramIndex++;
    }

    if (interested_properties !== undefined) {
      updateFields.push('interested_properties = $' + paramIndex);
      values.push(interested_properties);
      paramIndex++;
    }

    if (hold_properties !== undefined) {
      updateFields.push('hold_properties = $' + paramIndex);
      values.push(hold_properties);
      paramIndex++;
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, message: "No properties to update" });
    }

    values.push(clientId, brokerId);

    const sqlQuery = 'UPDATE contacts SET ' + updateFields.join(', ') + ' WHERE id = $' + paramIndex + ' AND broker_id = $' + (paramIndex + 1) + ' RETURNING *';
    
    
    const result = await query(sqlQuery, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Client not found" });
    }

    res.json({
      success: true,
      message: "Properties updated successfully!",
      data: result.rows[0]
    });

  } catch (err) {
    console.error("Update Client Properties Error:", err);
    next(err);
  }
};
