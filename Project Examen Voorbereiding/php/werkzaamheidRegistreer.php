<?php
	require "connect.php";

	function GUID(){
		if (function_exists('com_create_guid') === true){
			return trim(com_create_guid(), '{}');
		}

		return sprintf('%04X%04X-%04X-%04X-%04X-%04X%04X%04X', mt_rand(0, 65535), mt_rand(0, 65535), mt_rand(0, 65535), mt_rand(16384, 20479), mt_rand(32768, 49151), mt_rand(0, 65535), mt_rand(0, 65535), mt_rand(0, 65535));
	}
	
	$valid = true;
	
	$id = GUID();
	$customer_id = $_POST['klant_id'];
	$mechanic_id = $_POST['monteur'];
	$type = $_POST['type'];
	$datum = $_POST['datum'];
	$lengteInMin = $_POST['lengteInMin'];
	$description = $_POST['toelichting'];
	
	if($mechanic_id == ""){
		$valid = false;
		$_SESSION['meldingen']['monteur'] = "Geen monteur geselecteerd";
	}else{
		$_SESSION['werkzaamheidGegevens']['monteur'] = $mechanic_id;
	}

	if($type == ""){
		$valid = false;
		$_SESSION['meldingen']['type'] = "Geen type geselecteerd";
	}else{
		$_SESSION['werkzaamheidGegevens']['type'] = $type;
	}

	if($datum == ""){
		$valid = false;
		$_SESSION['meldingen']['datum'] = "Geen datum geselecteerd";
	}else{
		$_SESSION['werkzaamheidGegevens']['datum'] = $datum;
	}

	if($lengteInMin == ""){
		$valid = false;
		$_SESSION['meldingen']['lengteInMin'] = "Lengte mag niet leeg zijn";
	}elseif(intval($lengteInMin) <= 0){
		$_SESSION['meldingen']['lengteInMin'] = "Lengte mag niet lager dan 0 zijn";
	}else{
		$_SESSION['werkzaamheidGegevens']['lengteInMin'] = $lengteInMin;
	}

	if($valid){
		$sql_user = "INSERT INTO werkzaamheden (Id, MonteurId, KlantId, Type, Datum, LengteInMin, Toelichting) VALUES ('$id', '$mechanic_id', '$customer_id', '$type', '" . strtotime($datum) . "', '$lengteInMin', '$description')";
		$result_user = $conn->prepare($sql_user);
		$result_user->execute();
	
		unset($_SESSION['klantenGegevens']);
		header("Location: ../index.php?page=agenda.inc.php");
	}
	else{
		header("Location: ../index.php?page=werkzaamheidRegistreer.inc.php&klantId=" . $customer_id);
	}
?>