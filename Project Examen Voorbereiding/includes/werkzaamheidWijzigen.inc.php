<h1>Werkzaamheid wijzigen</h1>
<?php

	$klant_id = $_GET['klantId'];

	$sql_monteurs = "SELECT * FROM gebruikers WHERE Rol='1'";
	$result_monteurs = $conn->prepare($sql_monteurs);
	$result_monteurs ->execute();

	$id = $_GET['id'];
	$sql = "SELECT * FROM werkzaamheden WHERE Id='$id'";

	$result = $conn->prepare($sql);
	$result->bindParam(':id', $id);
	$result->execute();
	$customer = $result->fetch(PDO::FETCH_ASSOC);
?>
<form id="formUserRegister" method="post" action="php/werkzaamheidRegistreer.php">
	<span>Monteur:</span>
	<br>
	<select name="monteur">
		<option selected>---</option>
		<?php
			while($mechanics = $result_monteurs->fetch(PDO::FETCH_ASSOC)) {
				echo "<option value='" . $mechanics["Id"] . "'> " . $mechanics["Naam"] . " </option>";
			}
		?>
	</select>
	<br>
	<span class="validationError"><?php if(isset($_SESSION['meldingen']['monteur'])){echo $_SESSION['meldingen']['monteur'];} ?></span>
	<br>
	<br>
	<span>Type:</span>
	<br>
	<select name="type">
		<option selected>---</option>
		<option <?php if(isset($_SESSION['werkzaamheidGegevens']['type'])){if($_SESSION['werkzaamheidGegevens']['type'] == "Installatie"){ echo 'selected';}}?> value="Installatie">Installatie</option>
		<option <?php if(isset($_SESSION['werkzaamheidGegevens']['type'])){if($_SESSION['werkzaamheidGegevens']['type'] == "Reparatie"){ echo 'selected';}}?> value="Reparatie">Reparatie</option>
		<option <?php if(isset($_SESSION['werkzaamheidGegevens']['type'])){if($_SESSION['werkzaamheidGegevens']['type'] == "Overig"){ echo 'selected';}}?> value="Overig">Overig</option>
	</select>
	<br>
	<span class="validationError"><?php if(isset($_SESSION['meldingen']['type'])){echo $_SESSION['meldingen']['type'];} ?></span>
	<br>
	<br>
	<span>Datum:</span>
	<br>
	<input type="datetime-local" name="datum">
	<br>
	<span class="validationError"><?php if(isset($_SESSION['meldingen']['datum'])){echo $_SESSION['meldingen']['datum'];} ?></span>
	<br>
	<br>
	<span>Lengte:</span>
	<br>
	<input type="text" name="lengteInMin" class="inputText" value="<?php if(isset($_SESSION['werkzaamheidGegevens']['lengteInMin'])){echo $_SESSION['werkzaamheidGegevens']['lengteInMin'];} ?>">
	<br>
	<span class="validationError"><?php if(isset($_SESSION['meldingen']['lengteInMin'])){echo $_SESSION['meldingen']['lengteInMin'];} ?></span>
	<br>
	<br>
	<span>Toelichting:</span>
	<br>
	<textarea name="toelichting"></textarea>
	<br>
	<span class="validationError"><?php if(isset($_SESSION['meldingen']['toelichting'])){echo $_SESSION['meldingen']['toelichting'];} ?></span>
	<br>
	<br>
	<br>
	<br>
	<input type="hidden" name="klant_id" value="<?php echo $klant_id;?>">
	<input type='submit' name ='action' value='Toevoegen'/>
</form>

<?php
	unset($_SESSION['meldingen']);
	unset($_SESSION['werkzaamheidGegevens']);
?>